<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Company;
use App\Models\Favorite;
use App\Models\JobOffer;
use App\Models\ProfessionalProfile;
use App\Models\Role;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            SkillSeeder::class,
        ]);

        $skillIds = Skill::pluck('id');

        // Administrador de prueba (clave: password)
        User::factory()->admin()->create([
            'email' => 'admin@careertrack.test',
        ]);

        // Empresas con sus ofertas y habilidades requeridas
        Company::factory(5)->create()->each(function (Company $company) use ($skillIds) {
            JobOffer::factory(fake()->numberBetween(2, 4))
                ->for($company)
                ->create()
                ->each(fn (JobOffer $offer) => $offer->skills()->attach(
                    $skillIds->random(fake()->numberBetween(3, 5))->all()
                ));
        });

        // Profesionales con sus habilidades
        $professionals = ProfessionalProfile::factory(15)->create();
        $professionals->each(fn (ProfessionalProfile $p) => $p->skills()->attach(
            $skillIds->random(fake()->numberBetween(3, 6))->all()
        ));

        // Un profesional inactivo (baja lógica) para probar el bloqueo de acceso
        ProfessionalProfile::factory()
            ->for(User::factory()->professional()->inactive(), 'user')
            ->create();

        // Ofertas en distintos estados para probar el backoffice y los filtros
        JobOffer::factory()->paused()->create();
        JobOffer::factory()->pending()->create();
        JobOffer::factory()->blocked()->create();

        // Postulaciones y favoritos sin repetir pares (hay índice único)
        $offerIds = JobOffer::pluck('id');

        $professionals->each(function (ProfessionalProfile $p) use ($offerIds) {
            $applied = $offerIds->random(fake()->numberBetween(1, 3));
            foreach ($applied as $offerId) {
                Application::factory()->create([
                    'professional_id' => $p->id,
                    'job_offer_id' => $offerId,
                ]);
            }

            $saved = $offerIds->diff($applied)->random(min(2, $offerIds->diff($applied)->count()));
            foreach ($saved as $offerId) {
                Favorite::factory()->create([
                    'professional_id' => $p->id,
                    'job_offer_id' => $offerId,
                ]);
            }
        });
    }
}
