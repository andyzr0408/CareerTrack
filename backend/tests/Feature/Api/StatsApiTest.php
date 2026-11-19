<?php

namespace Tests\Feature\Api;

use App\Models\Application;
use App\Models\Favorite;
use App\Models\JobOffer;

/** Datos de los gráficos de pastel de los paneles. */
class StatsApiTest extends ApiTestCase
{
    public function test_professional_stats_count_their_applications_by_status_and_modality(): void
    {
        $profile = $this->actingAsProfessional();
        $company = $this->makeCompany();

        $remote = $this->makeOffer($company, [], ['modality' => 'remote']);
        $onsite = $this->makeOffer($company, [], ['modality' => 'onsite', 'location' => 'Lechería']);
        $other = $this->makeOffer($company, [], ['modality' => 'remote']);

        Application::factory()->create(['professional_id' => $profile->id, 'job_offer_id' => $remote->id, 'status' => 'pending']);
        Application::factory()->create(['professional_id' => $profile->id, 'job_offer_id' => $onsite->id, 'status' => 'accepted']);
        // De otra persona: no cuenta
        Application::factory()->create(['job_offer_id' => $other->id, 'status' => 'rejected']);
        Favorite::factory()->create(['professional_id' => $profile->id, 'job_offer_id' => $other->id]);

        $this->getJson('/api/profile/stats')
            ->assertOk()
            ->assertExactJson(['data' => [
                'total_applications' => 2,
                'favorites' => 1,
                'applications_by_status' => ['pending' => 1, 'reviewed' => 0, 'accepted' => 1, 'rejected' => 0],
                'applications_by_modality' => ['remote' => 1, 'onsite' => 1, 'hybrid' => 0],
            ]]);
    }

    public function test_professional_without_activity_gets_zeros(): void
    {
        $this->actingAsProfessional();

        $this->getJson('/api/profile/stats')
            ->assertOk()
            ->assertJsonPath('data.total_applications', 0)
            ->assertJsonPath('data.applications_by_status.pending', 0);
    }

    public function test_company_stats_group_applications_and_offers(): void
    {
        $company = $this->actingAsCompany();

        $live = $this->makeOffer($company);
        $this->makeOffer($company, [], ['status' => JobOffer::STATUS_PAUSED]);
        JobOffer::factory()->for($company)->pending()->create();
        JobOffer::factory()->for($company)->blocked()->create();

        Application::factory()->count(2)->create(['job_offer_id' => $live->id, 'status' => 'pending']);
        Application::factory()->create(['job_offer_id' => $live->id, 'status' => 'accepted']);
        // De otra empresa: no cuenta
        Application::factory()->create(['job_offer_id' => $this->makeOffer($this->makeCompany())->id, 'status' => 'pending']);

        $this->getJson('/api/company/stats')
            ->assertOk()
            ->assertExactJson(['data' => [
                'total_applications' => 3,
                'applications_by_status' => ['pending' => 2, 'reviewed' => 0, 'accepted' => 1, 'rejected' => 0],
                'offers_by_state' => ['live' => 1, 'paused' => 1, 'pending' => 1, 'blocked' => 1],
            ]]);
    }

    public function test_each_user_type_only_reaches_its_own_stats(): void
    {
        $this->actingAsCompany();
        $this->getJson('/api/profile/stats')->assertForbidden();

        $this->actingAsProfessional();
        $this->getJson('/api/company/stats')->assertForbidden();
    }
}
