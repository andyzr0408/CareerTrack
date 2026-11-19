<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Support\AuthCookie;
use Illuminate\Http\Request;
use Laravel\Sanctum\Sanctum;

/** El navegador guarda el token en una cookie httpOnly en lugar de leerlo con JavaScript. */
class CookieAuthTest extends ApiTestCase
{
    public function test_login_sets_an_http_only_cookie_with_the_token(): void
    {
        User::factory()->company()->create(['email' => 'emp@example.com']);

        $response = $this->postJson('/api/login', ['email' => 'emp@example.com', 'password' => 'password'])
            ->assertOk();

        $cookie = $response->getCookie(AuthCookie::NAME, false);

        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', $cookie->getSameSite());
        $this->assertSame($response->json('token'), $cookie->getValue());
    }

    public function test_register_also_sets_the_cookie(): void
    {
        $response = $this->postJson('/api/register', [
            'role' => 'professional',
            'email' => 'ana@example.com',
            'password' => 'secret123',
            'full_name' => 'Ana Pérez',
        ])->assertCreated();

        $this->assertNotNull($response->getCookie(AuthCookie::NAME, false));
    }

    public function test_sanctum_reads_the_token_from_the_cookie(): void
    {
        $callback = Sanctum::$accessTokenRetrievalCallback;
        $this->assertNotNull($callback, 'AppServiceProvider no registró getAccessTokenFromRequestUsing');

        $request = Request::create('/api/me', 'GET', [], [AuthCookie::NAME => '1|abc']);
        $this->assertSame('1|abc', $callback($request));
    }

    public function test_the_cookie_alone_authenticates_requests(): void
    {
        $user = $this->makeProfessional()->user;
        $token = $user->createToken('test')->plainTextToken;

        $this->withUnencryptedCookie(AuthCookie::NAME, $token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_an_invalid_cookie_is_rejected(): void
    {
        $this->withUnencryptedCookie(AuthCookie::NAME, '999|token-que-no-existe')
            ->getJson('/api/me')
            ->assertUnauthorized();
    }

    public function test_the_authorization_header_still_works_without_the_cookie(): void
    {
        $user = $this->makeCompany()->user;

        $this->withToken($user->createToken('test')->plainTextToken)
            ->getJson('/api/me')
            ->assertOk();
    }

    public function test_logout_revokes_the_token_and_expires_the_cookie(): void
    {
        $user = $this->makeProfessional()->user;
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withUnencryptedCookie(AuthCookie::NAME, $token)
            ->postJson('/api/logout')
            ->assertOk();

        $cookie = $response->getCookie(AuthCookie::NAME, false);
        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isCleared());
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
