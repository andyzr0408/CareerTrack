<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use App\Models\Favorite;
use App\Models\JobOffer;
use App\Models\ProfessionalProfile;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelRelationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_belongs_to_a_role_and_has_one_profile(): void
    {
        $user = User::factory()->professional()->create();
        $profile = ProfessionalProfile::factory()->for($user, 'user')->create();

        $this->assertSame('professional', $user->role->name);
        $this->assertTrue($user->isProfessional());
        $this->assertSame($profile->id, $user->professionalProfile->id);
        $this->assertSame($user->id, $profile->user->id);
    }

    public function test_company_has_many_job_offers(): void
    {
        $company = Company::factory()->create();
        JobOffer::factory(3)->for($company)->create();

        $this->assertCount(3, $company->jobOffers);
        $this->assertTrue($company->user->isCompany());
    }

    public function test_professional_can_have_many_skills(): void
    {
        $profile = ProfessionalProfile::factory()->create();
        $skills = Skill::factory(3)->create();

        $profile->skills()->attach($skills->pluck('id'));

        $this->assertCount(3, $profile->fresh()->skills);
        $this->assertCount(1, $skills->first()->professionals);
    }

    public function test_job_offer_can_require_many_skills(): void
    {
        $offer = JobOffer::factory()->create();
        $offer->skills()->attach(Skill::factory(2)->create()->pluck('id'));

        $this->assertCount(2, $offer->fresh()->skills);
    }

    public function test_published_scope_only_returns_active_and_approved_offers(): void
    {
        $company = Company::factory()->create();

        JobOffer::factory()->for($company)->create();
        JobOffer::factory()->for($company)->paused()->create();
        JobOffer::factory()->for($company)->pending()->create();
        JobOffer::factory()->for($company)->blocked()->create();

        $this->assertCount(1, JobOffer::published()->get());
    }

    public function test_professional_cannot_apply_twice_to_the_same_offer(): void
    {
        $profile = ProfessionalProfile::factory()->create();
        $offer = JobOffer::factory()->create();

        Application::factory()->create([
            'professional_id' => $profile->id,
            'job_offer_id' => $offer->id,
        ]);

        $this->expectException(QueryException::class);

        Application::factory()->create([
            'professional_id' => $profile->id,
            'job_offer_id' => $offer->id,
        ]);
    }

    public function test_professional_can_save_favorites_and_see_applied_offers(): void
    {
        $profile = ProfessionalProfile::factory()->create();
        $offer = JobOffer::factory()->create();

        Favorite::factory()->create(['professional_id' => $profile->id, 'job_offer_id' => $offer->id]);
        Application::factory()->create(['professional_id' => $profile->id, 'job_offer_id' => $offer->id]);

        $this->assertCount(1, $profile->favoriteJobOffers);
        $this->assertCount(1, $profile->appliedJobOffers);
        $this->assertCount(1, $offer->applicants);
    }

    public function test_inactive_user_is_not_active(): void
    {
        $this->assertFalse(User::factory()->inactive()->create()->isActive());
        $this->assertTrue(User::factory()->create()->isActive());
    }
}
