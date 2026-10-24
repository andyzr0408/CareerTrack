<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Company;
use App\Models\Favorite;
use App\Models\JobOffer;
use App\Models\ProfessionalProfile;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Datos de prueba de CareerTrack.
 *
 * Cuentas fijas (todas con la clave "password"):
 *   admin@careertrack.test        Administrador
 *   profesional@careertrack.test  Profesional
 *   empresa@careertrack.test      Empresa
 *   inactivo@careertrack.test     Profesional dado de baja (no debe poder entrar)
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            SkillSeeder::class,
        ]);

        $skills = Skill::pluck('id', 'name');
        $skillIds = $skills->values();

        $this->crearCuentasFijas($skills);
        $this->crearDatosAleatorios($skillIds);
    }

    /** Una cuenta por cada tipo de usuario, con datos conocidos para probar. */
    private function crearCuentasFijas($skills): void
    {
        // Administrador
        User::factory()->admin()->create(['email' => 'admin@careertrack.test']);

        // Empresa con una oferta en cada estado
        $company = Company::factory()
            ->for(User::factory()->company()->state(['email' => 'empresa@careertrack.test']), 'user')
            ->create(['trade_name' => 'TechVentures Inc.', 'tax_id' => 'J-12345678-9']);

        $ofertas = [
            ['title' => 'Desarrollador Backend Laravel', 'modality' => 'remote', 'location' => null,
                'status' => JobOffer::STATUS_ACTIVE, 'moderation_status' => JobOffer::MODERATION_APPROVED,
                'skills' => ['PHP', 'Laravel', 'MySQL']],
            ['title' => 'Desarrollador Frontend React', 'modality' => 'hybrid', 'location' => 'Bogotá',
                'status' => JobOffer::STATUS_ACTIVE, 'moderation_status' => JobOffer::MODERATION_APPROVED,
                'skills' => ['React', 'JavaScript', 'Tailwind CSS']],
            ['title' => 'Ingeniero DevOps', 'modality' => 'remote', 'location' => null,
                'status' => JobOffer::STATUS_PAUSED, 'moderation_status' => JobOffer::MODERATION_APPROVED,
                'skills' => ['Docker', 'AWS', 'Linux']],
            ['title' => 'Analista de Datos', 'modality' => 'onsite', 'location' => 'Caracas',
                'status' => JobOffer::STATUS_ACTIVE, 'moderation_status' => JobOffer::MODERATION_PENDING,
                'skills' => ['SQL', 'Python']],
            ['title' => 'Digitador Remoto', 'modality' => 'remote', 'location' => null,
                'status' => JobOffer::STATUS_ACTIVE, 'moderation_status' => JobOffer::MODERATION_BLOCKED,
                'skills' => ['Inglés']],
        ];

        $creadas = [];
        foreach ($ofertas as $data) {
            $names = $data['skills'];
            unset($data['skills']);

            $oferta = JobOffer::factory()->for($company)->create($data);
            $oferta->skills()->attach($skills->only($names)->values()->all());
            $creadas[] = $oferta;
        }

        // Profesional con skills, una postulación y un favorito
        $profesional = ProfessionalProfile::factory()
            ->for(User::factory()->professional()->state(['email' => 'profesional@careertrack.test']), 'user')
            ->create(['full_name' => 'Andrés Zerpa', 'headline' => 'Desarrollador Web']);

        $profesional->skills()->attach(
            $skills->only(['PHP', 'Laravel', 'React', 'JavaScript', 'SQL'])->values()->all()
        );

        Application::factory()->create([
            'professional_id' => $profesional->id,
            'job_offer_id' => $creadas[0]->id,
            'status' => Application::STATUS_PENDING,
        ]);
        Favorite::factory()->create([
            'professional_id' => $profesional->id,
            'job_offer_id' => $creadas[1]->id,
        ]);

        // Profesional dado de baja (baja lógica)
        ProfessionalProfile::factory()
            ->for(User::factory()->professional()->inactive()->state(['email' => 'inactivo@careertrack.test']), 'user')
            ->create(['full_name' => 'Usuario Inactivo']);
    }

    /** Volumen de datos para probar listados, filtros y el backoffice. */
    private function crearDatosAleatorios($skillIds): void
    {
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

        // Postulaciones y favoritos solo a ofertas visibles, sin repetir pares (hay índice único)
        $offerIds = JobOffer::published()->pluck('id');

        $professionals->each(function (ProfessionalProfile $p) use ($offerIds) {
            $applied = $offerIds->random(fake()->numberBetween(1, 3));
            foreach ($applied as $offerId) {
                Application::factory()->create([
                    'professional_id' => $p->id,
                    'job_offer_id' => $offerId,
                ]);
            }

            $rest = $offerIds->diff($applied);
            foreach ($rest->random(min(2, $rest->count())) as $offerId) {
                Favorite::factory()->create([
                    'professional_id' => $p->id,
                    'job_offer_id' => $offerId,
                ]);
            }
        });
    }
}
