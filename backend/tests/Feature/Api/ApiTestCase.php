<?php

namespace Tests\Feature\Api;

use App\Models\Company;
use App\Models\JobOffer;
use App\Models\ProfessionalProfile;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Base de las pruebas de la API: crea usuarios de cada tipo y los autentica con Sanctum. */
abstract class ApiTestCase extends TestCase
{
    use RefreshDatabase;

    protected function makeProfessional(array $attributes = []): ProfessionalProfile
    {
        return ProfessionalProfile::factory()->create($attributes);
    }

    protected function makeCompany(array $attributes = []): Company
    {
        return Company::factory()->create($attributes);
    }

    protected function makeAdmin(): User
    {
        return User::factory()->admin()->create();
    }

    /** Oferta de la empresa con las skills pedidas (se crean en el catálogo si no existen). */
    protected function makeOffer(Company $company, array $skills = [], array $attributes = []): JobOffer
    {
        $offer = JobOffer::factory()->for($company)->create($attributes);
        $offer->skills()->attach($this->skillIds($skills));

        return $offer;
    }

    /** @return array<int, int> */
    protected function skillIds(array $names): array
    {
        return collect($names)
            ->map(fn (string $name) => Skill::firstOrCreate(['name' => $name])->id)
            ->all();
    }

    protected function actingAsProfessional(array $attributes = []): ProfessionalProfile
    {
        $profile = $this->makeProfessional($attributes);
        Sanctum::actingAs($profile->user);

        return $profile;
    }

    protected function actingAsCompany(array $attributes = []): Company
    {
        $company = $this->makeCompany($attributes);
        Sanctum::actingAs($company->user);

        return $company;
    }

    protected function actingAsAdmin(): User
    {
        $admin = $this->makeAdmin();
        Sanctum::actingAs($admin);

        return $admin;
    }
}
