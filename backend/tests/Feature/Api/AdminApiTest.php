<?php

namespace Tests\Feature\Api;

use App\Models\Application;
use App\Models\JobOffer;
use App\Models\Skill;
use App\Models\User;

class AdminApiTest extends ApiTestCase
{
    public function test_stats_summarize_the_platform(): void
    {
        $company = $this->makeCompany();
        JobOffer::factory(2)->for($company)->pending()->create();
        JobOffer::factory()->for($company)->create();
        JobOffer::factory()->for($company)->blocked()->create();
        Application::factory(3)->create(['job_offer_id' => JobOffer::first()->id]);
        Skill::factory(2)->create();
        $this->actingAsAdmin();

        $this->getJson('/api/admin/stats')
            ->assertOk()
            ->assertJsonPath('data.offers.pending', 2)
            ->assertJsonPath('data.offers.approved', 1)
            ->assertJsonPath('data.offers.blocked', 1)
            ->assertJsonPath('data.applications', 3)
            ->assertJsonPath('data.users', User::count())
            ->assertJsonPath('data.skills', 2);
    }

    public function test_offers_can_be_filtered_by_moderation_status_and_searched(): void
    {
        $acme = $this->makeCompany(['trade_name' => 'Acme']);
        $zeta = $this->makeCompany(['trade_name' => 'Zeta']);
        JobOffer::factory()->for($acme)->pending()->create(['title' => 'Backend']);
        JobOffer::factory()->for($acme)->create(['title' => 'Frontend']);
        JobOffer::factory()->for($zeta)->blocked()->create(['title' => 'QA']);
        $this->actingAsAdmin();

        $this->getJson('/api/admin/job-offers')->assertOk()->assertJsonCount(3, 'data');
        $this->getJson('/api/admin/job-offers?moderation_status=pending')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Backend');
        $this->getJson('/api/admin/job-offers?search=zeta')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'QA');
        $this->getJson('/api/admin/job-offers?search=front')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/job-offers?moderation_status=otro')->assertUnprocessable();
    }

    public function test_offer_list_is_paginated_with_eight_per_page_by_default(): void
    {
        JobOffer::factory(10)->for($this->makeCompany())->create();
        $this->actingAsAdmin();

        $this->getJson('/api/admin/job-offers')
            ->assertOk()
            ->assertJsonCount(8, 'data')
            ->assertJsonPath('meta.per_page', 8)
            ->assertJsonPath('meta.total', 10)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonStructure(['data' => [['id', 'title', 'moderation_status', 'company' => ['trade_name'], 'skills']], 'links', 'meta']);

        $this->getJson('/api/admin/job-offers?page=2')->assertJsonCount(2, 'data');
    }

    public function test_admin_can_approve_or_block_an_offer(): void
    {
        $offer = JobOffer::factory()->for($this->makeCompany())->pending()->create();
        $this->actingAsAdmin();

        $this->patchJson("/api/admin/job-offers/{$offer->id}/moderation", ['moderation_status' => 'approved'])
            ->assertOk()->assertJsonPath('data.moderation_status', 'approved');
        $this->patchJson("/api/admin/job-offers/{$offer->id}/moderation", ['moderation_status' => 'blocked'])
            ->assertOk()->assertJsonPath('data.moderation_status', 'blocked');

        // "pending" lo pone la empresa al editar, no el administrador
        $this->patchJson("/api/admin/job-offers/{$offer->id}/moderation", ['moderation_status' => 'pending'])
            ->assertUnprocessable()->assertJsonValidationErrors(['moderation_status']);
        $this->patchJson('/api/admin/job-offers/99999/moderation', ['moderation_status' => 'approved'])->assertNotFound();
    }

    public function test_users_can_be_filtered_by_type_and_searched_by_email(): void
    {
        $this->makeProfessional(['full_name' => 'Ana Pérez'])->user->update(['email' => 'ana.perez@example.com']);
        $this->makeCompany(['trade_name' => 'Acme'])->user->update(['email' => 'rrhh@acme.test']);
        $this->actingAsAdmin();

        $this->getJson('/api/admin/users')->assertOk()->assertJsonCount(3, 'data');
        $this->getJson('/api/admin/users?role=company')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.role', 'company')
            ->assertJsonPath('data.0.name', 'Acme');
        $this->getJson('/api/admin/users?search=ana.perez')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Ana Pérez');
        $this->getJson('/api/admin/users?role=otro')->assertUnprocessable();
    }

    public function test_user_list_is_paginated(): void
    {
        User::factory(11)->professional()->create();
        $this->actingAsAdmin();

        $this->getJson('/api/admin/users?per_page=5&page=3')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('meta.last_page', 3)
            ->assertJsonStructure(['data' => [['id', 'email', 'role', 'status', 'name']]]);
    }

    public function test_admin_can_deactivate_and_reactivate_an_account(): void
    {
        $user = User::factory()->professional()->create();
        $user->createToken('test');
        $this->actingAsAdmin();

        $this->patchJson("/api/admin/users/{$user->id}/status", ['status' => 'inactive'])
            ->assertOk()->assertJsonPath('data.status', 'inactive');
        $this->assertFalse($user->fresh()->isActive());
        $this->assertDatabaseCount('personal_access_tokens', 0); // se cierran sus sesiones

        $this->patchJson("/api/admin/users/{$user->id}/status", ['status' => 'active'])
            ->assertOk()->assertJsonPath('data.status', 'active');
        $this->assertTrue($user->fresh()->isActive());

        $this->patchJson("/api/admin/users/{$user->id}/status", ['status' => 'suspendido'])
            ->assertUnprocessable()->assertJsonValidationErrors(['status']);
    }

    public function test_admin_cannot_deactivate_themselves(): void
    {
        $admin = $this->actingAsAdmin();

        $this->patchJson("/api/admin/users/{$admin->id}/status", ['status' => 'inactive'])->assertForbidden();

        $this->assertTrue($admin->fresh()->isActive());
    }

    public function test_admin_manages_the_skill_catalog(): void
    {
        $this->actingAsAdmin();

        $id = $this->postJson('/api/admin/skills', ['name' => 'Docker'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Docker')
            ->json('data.id');

        $this->postJson('/api/admin/skills', ['name' => 'Docker'])
            ->assertUnprocessable()->assertJsonValidationErrors(['name']);

        $this->putJson("/api/admin/skills/{$id}", ['name' => 'Docker'])->assertOk(); // conserva su nombre
        $this->putJson("/api/admin/skills/{$id}", ['name' => 'Kubernetes'])
            ->assertOk()->assertJsonPath('data.name', 'Kubernetes');

        $this->deleteJson("/api/admin/skills/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('skills', ['id' => $id]);
    }

    public function test_renaming_a_skill_to_an_existing_name_is_rejected(): void
    {
        $this->skillIds(['PHP']);
        $docker = Skill::create(['name' => 'Docker']);
        $this->actingAsAdmin();

        $this->putJson("/api/admin/skills/{$docker->id}", ['name' => 'PHP'])
            ->assertUnprocessable()->assertJsonValidationErrors(['name']);
    }

    public function test_deleting_a_skill_removes_it_from_profiles_and_offers(): void
    {
        $company = $this->makeCompany();
        $offer = $this->makeOffer($company, ['PHP', 'Laravel']);
        $profile = $this->makeProfessional();
        $php = Skill::where('name', 'PHP')->first();
        $profile->skills()->attach($php->id);
        $this->actingAsAdmin();

        $this->deleteJson("/api/admin/skills/{$php->id}")->assertNoContent();

        $this->assertSame(['Laravel'], $offer->skills()->pluck('name')->all());
        $this->assertSame(0, $profile->skills()->count());
    }
}
