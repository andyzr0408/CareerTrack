<?php

namespace Tests\Feature\Api;

use App\Models\Application;
use App\Models\Favorite;
use App\Models\JobOffer;

class CompanyApiTest extends ApiTestCase
{
    private function validOffer(array $overrides = []): array
    {
        $this->skillIds(['PHP', 'Laravel']);

        return array_merge([
            'title' => 'Desarrollador Backend',
            'modality' => 'hybrid',
            'location' => 'Caracas',
            'salary_range' => '$1000 - $1500',
            'skills' => ['PHP', 'Laravel'],
        ], $overrides);
    }

    // ---- Empresa --------------------------------------------------------------------------

    public function test_company_sees_its_data_with_stats(): void
    {
        $company = $this->actingAsCompany(['trade_name' => 'Acme']);
        $live = JobOffer::factory()->for($company)->create();
        JobOffer::factory()->for($company)->paused()->create();
        Application::factory()->create(['job_offer_id' => $live->id, 'status' => 'accepted']);
        Application::factory()->create(['job_offer_id' => $live->id, 'status' => 'pending']);
        Application::factory()->create(); // de otra empresa: no cuenta

        $this->getJson('/api/company')
            ->assertOk()
            ->assertJsonPath('data.trade_name', 'Acme')
            ->assertJsonPath('data.stats.total_offers', 2)
            ->assertJsonPath('data.stats.live_offers', 1)
            ->assertJsonPath('data.stats.applications_received', 2)
            ->assertJsonPath('data.stats.accepted', 1);
    }

    public function test_company_can_update_its_data_but_not_steal_a_tax_id(): void
    {
        $taken = $this->makeCompany(['tax_id' => 'J-11111111-1']);
        $company = $this->actingAsCompany(['tax_id' => 'J-22222222-2']);

        $this->putJson('/api/company', ['trade_name' => 'Nuevo nombre', 'tax_id' => 'J-22222222-2'])
            ->assertOk()
            ->assertJsonPath('data.trade_name', 'Nuevo nombre');

        $this->putJson('/api/company', ['trade_name' => 'Nuevo nombre', 'tax_id' => $taken->tax_id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['tax_id']);

        $this->assertSame('J-22222222-2', $company->fresh()->tax_id);
    }

    // ---- Ofertas --------------------------------------------------------------------------

    public function test_company_lists_only_its_offers_in_any_state_with_counts(): void
    {
        $company = $this->actingAsCompany();
        $offer = JobOffer::factory()->for($company)->create();
        JobOffer::factory()->for($company)->paused()->create();
        JobOffer::factory()->for($company)->blocked()->create();
        JobOffer::factory()->create(); // de otra empresa
        Application::factory()->create(['job_offer_id' => $offer->id, 'status' => 'pending']);
        Application::factory()->create(['job_offer_id' => $offer->id, 'status' => 'accepted']);

        $this->getJson('/api/company/job-offers?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonStructure(['data' => [['id', 'status', 'moderation_status', 'skills', 'applications_count', 'pending_applications_count']]]);

        $withApplications = collect($this->getJson('/api/company/job-offers?per_page=10')->json('data'))
            ->firstWhere('id', $offer->id);

        $this->assertSame(2, $withApplications['applications_count']);
        $this->assertSame(1, $withApplications['pending_applications_count']);
    }

    public function test_company_can_publish_an_offer_that_starts_pending_moderation(): void
    {
        $company = $this->actingAsCompany();

        $response = $this->postJson('/api/company/job-offers', $this->validOffer())
            ->assertCreated()
            ->assertJsonPath('data.title', 'Desarrollador Backend')
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.moderation_status', 'pending');

        $this->assertEqualsCanonicalizing(['PHP', 'Laravel'], $response->json('data.skills'));
        $this->assertDatabaseHas('job_offers', ['company_id' => $company->id, 'title' => 'Desarrollador Backend']);
    }

    public function test_remote_offers_do_not_need_a_city_but_the_others_do(): void
    {
        $this->actingAsCompany();

        $this->postJson('/api/company/job-offers', $this->validOffer(['modality' => 'remote', 'location' => null]))
            ->assertCreated()
            ->assertJsonPath('data.location', null);

        $this->postJson('/api/company/job-offers', $this->validOffer(['modality' => 'onsite', 'location' => null]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['location']);
    }

    public function test_offer_validation(): void
    {
        $this->actingAsCompany();

        $this->postJson('/api/company/job-offers', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'modality', 'skills']);

        $this->postJson('/api/company/job-offers', $this->validOffer(['skills' => []]))
            ->assertUnprocessable()->assertJsonValidationErrors(['skills']);

        $this->postJson('/api/company/job-offers', $this->validOffer(['skills' => ['NoExiste']]))
            ->assertUnprocessable()->assertJsonValidationErrors(['skills.0']);

        $this->postJson('/api/company/job-offers', $this->validOffer(['modality' => 'volando']))
            ->assertUnprocessable()->assertJsonValidationErrors(['modality']);
    }

    public function test_editing_an_approved_offer_sends_it_back_to_review_but_a_blocked_one_stays_blocked(): void
    {
        $company = $this->actingAsCompany();
        $approved = $this->makeOffer($company, ['PHP'], ['moderation_status' => 'approved']);
        $blocked = $this->makeOffer($company, ['PHP'], ['moderation_status' => 'blocked']);

        $this->putJson("/api/company/job-offers/{$approved->id}", $this->validOffer(['title' => 'Título nuevo']))
            ->assertOk()
            ->assertJsonPath('data.title', 'Título nuevo')
            ->assertJsonPath('data.moderation_status', 'pending');

        $this->putJson("/api/company/job-offers/{$blocked->id}", $this->validOffer())
            ->assertOk()
            ->assertJsonPath('data.moderation_status', 'blocked');
    }

    public function test_company_can_pause_and_reactivate_an_offer(): void
    {
        $company = $this->actingAsCompany();
        $offer = $this->makeOffer($company);

        $this->patchJson("/api/company/job-offers/{$offer->id}/status", ['status' => 'paused'])
            ->assertOk()->assertJsonPath('data.status', 'paused');
        $this->patchJson("/api/company/job-offers/{$offer->id}/status", ['status' => 'active'])
            ->assertOk()->assertJsonPath('data.status', 'active');
        $this->patchJson("/api/company/job-offers/{$offer->id}/status", ['status' => 'borrada'])
            ->assertUnprocessable()->assertJsonValidationErrors(['status']);
    }

    public function test_company_cannot_touch_offers_of_another_company(): void
    {
        $this->actingAsCompany();
        $foreign = $this->makeOffer($this->makeCompany(), ['PHP']);

        $this->putJson("/api/company/job-offers/{$foreign->id}", $this->validOffer())->assertNotFound();
        $this->patchJson("/api/company/job-offers/{$foreign->id}/status", ['status' => 'paused'])->assertNotFound();
        $this->deleteJson("/api/company/job-offers/{$foreign->id}")->assertNotFound();
        $this->getJson("/api/company/job-offers/{$foreign->id}/applications")->assertNotFound();

        $this->assertDatabaseHas('job_offers', ['id' => $foreign->id, 'status' => 'active']);
    }

    public function test_deleting_an_offer_removes_its_applications_favorites_and_skills(): void
    {
        $company = $this->actingAsCompany();
        $offer = $this->makeOffer($company, ['PHP', 'Laravel']);
        Application::factory()->create(['job_offer_id' => $offer->id]);
        Favorite::factory()->create(['job_offer_id' => $offer->id]);

        $this->deleteJson("/api/company/job-offers/{$offer->id}")->assertNoContent();

        $this->assertDatabaseMissing('job_offers', ['id' => $offer->id]);
        $this->assertDatabaseCount('applications', 0);
        $this->assertDatabaseCount('favorites', 0);
        $this->assertDatabaseCount('job_offer_skill', 0);
        $this->assertDatabaseCount('skills', 2); // el catálogo no se toca
    }

    // ---- Candidatos -----------------------------------------------------------------------

    public function test_company_lists_the_candidates_of_an_offer_paginated(): void
    {
        $company = $this->actingAsCompany();
        $offer = $this->makeOffer($company);
        $other = $this->makeOffer($company);
        Application::factory(3)->create(['job_offer_id' => $offer->id]);
        Application::factory()->create(['job_offer_id' => $other->id]);

        $this->getJson("/api/company/job-offers/{$offer->id}/applications?per_page=2")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonStructure(['data' => [['id', 'status', 'applied_at', 'professional' => ['id', 'full_name', 'headline', 'cv', 'skills']]]]);
    }

    public function test_company_can_change_the_status_of_a_candidate(): void
    {
        $company = $this->actingAsCompany();
        $application = Application::factory()->create([
            'job_offer_id' => $this->makeOffer($company)->id,
            'status' => 'pending',
        ]);

        $this->patchJson("/api/company/applications/{$application->id}", ['status' => 'accepted'])
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        $this->patchJson("/api/company/applications/{$application->id}", ['status' => 'contratado'])
            ->assertUnprocessable()->assertJsonValidationErrors(['status']);

        $this->assertSame('accepted', $application->fresh()->status);
    }

    public function test_company_cannot_change_candidates_of_another_company(): void
    {
        $this->actingAsCompany();
        $foreign = Application::factory()->create(['status' => 'pending']);

        $this->patchJson("/api/company/applications/{$foreign->id}", ['status' => 'rejected'])->assertNotFound();

        $this->assertSame('pending', $foreign->fresh()->status);
    }
}
