<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Laravel\Sanctum\Sanctum;

class AuthApiTest extends ApiTestCase
{
    public function test_professional_can_register_and_gets_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'role' => 'professional',
            'email' => 'Ana@Example.com',
            'password' => 'secret123',
            'full_name' => 'Ana Pérez',
            'headline' => 'Desarrolladora Backend',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'email', 'role', 'status', 'name', 'created_at', 'professional' => ['id', 'full_name', 'cv', 'skills']],
            ])
            ->assertJsonPath('user.email', 'ana@example.com') // se guarda en minúsculas
            ->assertJsonPath('user.role', 'professional')
            ->assertJsonPath('user.name', 'Ana Pérez');

        $this->assertDatabaseHas('professional_profiles', ['full_name' => 'Ana Pérez']);
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_company_can_register(): void
    {
        $this->postJson('/api/register', [
            'role' => 'company',
            'email' => 'rrhh@acme.test',
            'password' => 'secret123',
            'trade_name' => 'Acme C.A.',
            'tax_id' => 'J-12345678-9',
        ])
            ->assertCreated()
            ->assertJsonPath('user.role', 'company')
            ->assertJsonPath('user.company.trade_name', 'Acme C.A.');

        $this->assertDatabaseHas('companies', ['tax_id' => 'J-12345678-9']);
    }

    public function test_register_validates_the_data(): void
    {
        $this->postJson('/api/register', [
            'role' => 'company',
            'email' => 'no-es-correo',
            'password' => 'corta',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password', 'trade_name', 'tax_id']);

        // El administrador no se registra desde la web
        $this->postJson('/api/register', [
            'role' => 'admin',
            'email' => 'x@x.test',
            'password' => 'secret123',
        ])->assertUnprocessable()->assertJsonValidationErrors(['role']);
    }

    public function test_register_rejects_a_duplicate_email_and_tax_id(): void
    {
        $existing = $this->makeCompany();

        $this->postJson('/api/register', [
            'role' => 'company',
            'email' => $existing->user->email,
            'password' => 'secret123',
            'trade_name' => 'Otra',
            'tax_id' => $existing->tax_id,
        ])->assertUnprocessable()->assertJsonValidationErrors(['email', 'tax_id']);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->professional()->create(['email' => 'ana@example.com']);

        $this->postJson('/api/login', ['email' => 'ana@example.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'email', 'role', 'status']])
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_login_fails_with_wrong_credentials(): void
    {
        User::factory()->professional()->create(['email' => 'ana@example.com']);

        $this->postJson('/api/login', ['email' => 'ana@example.com', 'password' => 'incorrecta'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->postJson('/api/login', ['email' => 'nadie@example.com', 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_checks_the_account_type_when_the_frontend_sends_it(): void
    {
        User::factory()->professional()->create(['email' => 'ana@example.com']);

        $this->postJson('/api/login', ['email' => 'ana@example.com', 'password' => 'password', 'role' => 'company'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->postJson('/api/login', ['email' => 'ana@example.com', 'password' => 'password', 'role' => 'professional'])
            ->assertOk();
    }

    public function test_inactive_account_cannot_login(): void
    {
        User::factory()->professional()->inactive()->create(['email' => 'baja@example.com']);

        $this->postJson('/api/login', ['email' => 'baja@example.com', 'password' => 'password'])
            ->assertForbidden();
    }

    public function test_me_requires_a_token(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }

    public function test_me_returns_the_authenticated_user_with_profile(): void
    {
        $profile = $this->actingAsProfessional(['full_name' => 'Ana Pérez']);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.id', $profile->user->id)
            ->assertJsonPath('data.role', 'professional')
            ->assertJsonPath('data.professional.full_name', 'Ana Pérez');
    }

    public function test_token_from_login_authenticates_later_requests(): void
    {
        User::factory()->company()->create(['email' => 'emp@example.com']);

        $token = $this->postJson('/api/login', ['email' => 'emp@example.com', 'password' => 'password'])
            ->json('token');

        $this->withToken($token)->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'emp@example.com');
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = User::factory()->professional()->create();
        $token = $user->createToken('test')->plainTextToken;
        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withToken($token)->postJson('/api/logout')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_user_can_deactivate_their_own_account(): void
    {
        $user = User::factory()->professional()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->patchJson('/api/me/deactivate')->assertOk();

        $this->assertFalse($user->fresh()->isActive());
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_admin_cannot_deactivate_themselves_from_me(): void
    {
        $admin = $this->actingAsAdmin();

        $this->patchJson('/api/me/deactivate')->assertForbidden();

        $this->assertTrue($admin->fresh()->isActive());
    }

    public function test_token_of_an_account_deactivated_later_is_rejected_and_revoked(): void
    {
        $user = User::factory()->professional()->create();
        $token = $user->createToken('test')->plainTextToken;
        $user->update(['status' => User::STATUS_INACTIVE]);

        $this->withToken($token)->getJson('/api/me')->assertForbidden();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_each_user_type_can_only_use_its_own_routes(): void
    {
        // Profesional
        Sanctum::actingAs($this->makeProfessional()->user);
        $this->getJson('/api/job-offers')->assertOk();
        $this->getJson('/api/company')->assertForbidden();
        $this->getJson('/api/admin/stats')->assertForbidden();

        // Empresa
        Sanctum::actingAs($this->makeCompany()->user);
        $this->getJson('/api/company')->assertOk();
        $this->getJson('/api/job-offers')->assertForbidden();
        $this->getJson('/api/admin/stats')->assertForbidden();

        // Administrador
        Sanctum::actingAs($this->makeAdmin());
        $this->getJson('/api/admin/stats')->assertOk();
        $this->getJson('/api/job-offers')->assertForbidden();
        $this->getJson('/api/company')->assertForbidden();
    }

    public function test_guest_gets_401_on_every_protected_group(): void
    {
        foreach (['/api/me', '/api/job-offers', '/api/applications', '/api/company', '/api/admin/stats'] as $url) {
            $this->getJson($url)->assertUnauthorized();
        }
    }

    public function test_skill_catalog_is_public(): void
    {
        $this->skillIds(['PHP', 'Laravel']);

        $this->getJson('/api/skills')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Laravel') // orden alfabético
            ->assertJsonStructure(['data' => [['id', 'name']]]);
    }

    public function test_unknown_api_route_returns_a_json_404(): void
    {
        $this->getJson('/api/no-existe')->assertNotFound()->assertJsonStructure(['message']);
    }
}
