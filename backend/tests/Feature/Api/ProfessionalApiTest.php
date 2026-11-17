<?php

namespace Tests\Feature\Api;

use App\Models\Application;
use App\Models\Favorite;
use App\Models\JobOffer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfessionalApiTest extends ApiTestCase
{
    // ---- Catálogo de ofertas ---------------------------------------------------------------

    public function test_catalog_lists_only_published_offers_and_paginates(): void
    {
        $company = $this->makeCompany();
        JobOffer::factory(5)->for($company)->create();
        JobOffer::factory()->for($company)->paused()->create();
        JobOffer::factory()->for($company)->pending()->create();
        JobOffer::factory()->for($company)->blocked()->create();
        $this->actingAsProfessional();

        $this->getJson('/api/job-offers?per_page=2&page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 5)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.last_page', 3)
            ->assertJsonStructure([
                'data' => [[
                    'id', 'title', 'modality', 'location', 'salary_range', 'status', 'moderation_status',
                    'created_at', 'days_ago', 'company' => ['id', 'trade_name'], 'skills', 'saved', 'application',
                ]],
                'links',
                'meta' => ['current_page', 'last_page', 'per_page', 'total', 'from', 'to'],
            ]);
    }

    public function test_catalog_page_size_defaults_to_six_and_has_a_limit(): void
    {
        JobOffer::factory(7)->for($this->makeCompany())->create();
        $this->actingAsProfessional();

        $this->getJson('/api/job-offers')->assertOk()->assertJsonCount(6, 'data')->assertJsonPath('meta.per_page', 6);
        $this->getJson('/api/job-offers?per_page=500')->assertUnprocessable()->assertJsonValidationErrors(['per_page']);
        $this->getJson('/api/job-offers?page=0')->assertUnprocessable()->assertJsonValidationErrors(['page']);
    }

    public function test_catalog_filters_by_text_and_modality(): void
    {
        $acme = $this->makeCompany(['trade_name' => 'Acme']);
        $other = $this->makeCompany(['trade_name' => 'Zeta']);
        $this->makeOffer($acme, ['PHP'], ['title' => 'Desarrollador Laravel', 'modality' => 'remote', 'location' => null]);
        $this->makeOffer($other, ['Figma'], ['title' => 'Diseñador UX', 'modality' => 'onsite', 'location' => 'Madrid']);
        $this->actingAsProfessional();

        $this->getJson('/api/job-offers?search=laravel')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Desarrollador Laravel');
        $this->getJson('/api/job-offers?search=zeta')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Diseñador UX'); // por empresa
        $this->getJson('/api/job-offers?search=madrid')->assertJsonCount(1, 'data');                                              // por ciudad
        $this->getJson('/api/job-offers?search=figma')->assertJsonCount(1, 'data');                                               // por skill
        $this->getJson('/api/job-offers?modality=remote')->assertJsonCount(1, 'data')->assertJsonPath('data.0.modality', 'remote');
        $this->getJson('/api/job-offers?modality=cualquiera')->assertUnprocessable();
    }

    public function test_catalog_skill_filter_requires_all_selected_skills(): void
    {
        $company = $this->makeCompany();
        $both = $this->makeOffer($company, ['PHP', 'Laravel']);
        $this->makeOffer($company, ['PHP']);
        $this->actingAsProfessional();

        $query = http_build_query(['skills' => ['PHP', 'Laravel']]);

        $this->getJson('/api/job-offers?'.$query)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $both->id);
    }

    public function test_catalog_can_be_sorted_by_match_percentage(): void
    {
        $company = $this->makeCompany();
        $half = $this->makeOffer($company, ['PHP', 'Laravel', 'Vue', 'React']); // 2 de 4 = 50 %
        $full = $this->makeOffer($company, ['PHP']);                           // 1 de 1 = 100 %
        $none = $this->makeOffer($company, ['Figma']);                         // 0 %

        $profile = $this->actingAsProfessional();
        $profile->skills()->attach($this->skillIds(['PHP', 'Laravel']));

        $ids = collect($this->getJson('/api/job-offers?sort=match')->assertOk()->json('data'))->pluck('id')->all();

        $this->assertSame([$full->id, $half->id, $none->id], $ids);
    }

    public function test_catalog_shows_saved_and_application_state_of_the_viewer(): void
    {
        $offer = $this->makeOffer($this->makeCompany(), ['PHP']);
        $other = $this->makeProfessional();
        Favorite::create(['professional_id' => $other->id, 'job_offer_id' => $offer->id]); // de otra persona

        $me = $this->actingAsProfessional();
        $this->getJson('/api/job-offers')
            ->assertJsonPath('data.0.saved', false)
            ->assertJsonPath('data.0.application', null);

        Favorite::create(['professional_id' => $me->id, 'job_offer_id' => $offer->id]);
        Application::factory()->create(['professional_id' => $me->id, 'job_offer_id' => $offer->id, 'status' => 'reviewed']);

        $this->getJson('/api/job-offers')
            ->assertJsonPath('data.0.saved', true)
            ->assertJsonPath('data.0.application.status', 'reviewed');
    }

    public function test_show_returns_a_published_offer_and_404_for_the_rest(): void
    {
        $company = $this->makeCompany();
        $offer = JobOffer::factory()->for($company)->create(['created_at' => now()->subDays(3)]);
        $paused = JobOffer::factory()->for($company)->paused()->create();
        $this->actingAsProfessional();

        $this->getJson("/api/job-offers/{$offer->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $offer->id)
            ->assertJsonPath('data.days_ago', 3);

        $this->getJson("/api/job-offers/{$paused->id}")->assertNotFound();
        $this->getJson('/api/job-offers/99999')->assertNotFound();
    }

    // ---- Perfil ---------------------------------------------------------------------------

    public function test_profile_can_be_read_and_updated(): void
    {
        $me = $this->actingAsProfessional(['full_name' => 'Ana Pérez']);
        Favorite::factory()->create(['professional_id' => $me->id]);

        $this->getJson('/api/profile')
            ->assertOk()
            ->assertJsonPath('data.full_name', 'Ana Pérez')
            ->assertJsonPath('data.favorites_count', 1)
            ->assertJsonPath('data.applications_count', 0);

        $this->putJson('/api/profile', ['full_name' => 'Ana María Pérez', 'headline' => 'Full Stack'])
            ->assertOk()
            ->assertJsonPath('data.full_name', 'Ana María Pérez')
            ->assertJsonPath('data.headline', 'Full Stack');

        $this->putJson('/api/profile', ['headline' => 'Solo titular'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['full_name']);
    }

    public function test_cv_can_be_uploaded_and_replaces_the_previous_one(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('cvs/viejo.pdf', 'contenido');
        $me = $this->actingAsProfessional(['full_name' => 'Ana Pérez', 'cv_document' => 'cvs/viejo.pdf']);

        $this->postJson('/api/profile/cv', ['cv' => UploadedFile::fake()->create('mi cv.pdf', 200, 'application/pdf')])
            ->assertOk()
            ->assertJsonPath('data.cv.name', 'cv-ana-perez.pdf');

        Storage::disk('public')->assertExists("cvs/{$me->id}/cv-ana-perez.pdf");
        Storage::disk('public')->assertMissing('cvs/viejo.pdf');
        $this->assertSame("cvs/{$me->id}/cv-ana-perez.pdf", $me->fresh()->cv_document);
    }

    public function test_cv_must_be_a_pdf_of_at_most_5_mb(): void
    {
        Storage::fake('public');
        $this->actingAsProfessional();

        $this->postJson('/api/profile/cv', ['cv' => UploadedFile::fake()->create('foto.png', 10, 'image/png')])
            ->assertUnprocessable()->assertJsonValidationErrors(['cv']);

        $this->postJson('/api/profile/cv', ['cv' => UploadedFile::fake()->create('grande.pdf', 6000, 'application/pdf')])
            ->assertUnprocessable()->assertJsonValidationErrors(['cv']);

        $this->postJson('/api/profile/cv', [])->assertUnprocessable()->assertJsonValidationErrors(['cv']);
    }

    public function test_skills_are_synced_by_name(): void
    {
        $this->skillIds(['PHP', 'Laravel', 'Vue']);
        $me = $this->actingAsProfessional();

        $response = $this->putJson('/api/profile/skills', ['skills' => ['PHP', 'Laravel']])->assertOk();
        $this->assertEqualsCanonicalizing(['PHP', 'Laravel'], $response->json('data.skills'));

        $response = $this->putJson('/api/profile/skills', ['skills' => ['Vue']])->assertOk();
        $this->assertSame(['Vue'], $response->json('data.skills'));
        $this->assertSame(1, $me->skills()->count());

        $this->putJson('/api/profile/skills', ['skills' => []])->assertOk()->assertJsonPath('data.skills', []);
        $this->putJson('/api/profile/skills', ['skills' => ['NoExiste']])
            ->assertUnprocessable()->assertJsonValidationErrors(['skills.0']);
        $this->putJson('/api/profile/skills', [])->assertUnprocessable()->assertJsonValidationErrors(['skills']);
    }

    // ---- Postulaciones --------------------------------------------------------------------

    public function test_professional_can_apply_to_a_published_offer(): void
    {
        $offer = $this->makeOffer($this->makeCompany(), ['PHP']);
        $me = $this->actingAsProfessional();

        $this->postJson("/api/job-offers/{$offer->id}/applications")
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.offer.id', $offer->id)
            ->assertJsonStructure(['data' => ['id', 'status', 'applied_at', 'days_ago', 'offer' => ['company' => ['trade_name'], 'skills']]]);

        $this->assertDatabaseHas('applications', ['professional_id' => $me->id, 'job_offer_id' => $offer->id]);
    }

    public function test_applying_requires_a_cv(): void
    {
        $offer = $this->makeOffer($this->makeCompany());
        $this->actingAsProfessional(['cv_document' => null]);

        $this->postJson("/api/job-offers/{$offer->id}/applications")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cv']);

        $this->assertDatabaseCount('applications', 0);
    }

    public function test_applying_twice_returns_409(): void
    {
        $offer = $this->makeOffer($this->makeCompany());
        $this->actingAsProfessional();

        $this->postJson("/api/job-offers/{$offer->id}/applications")->assertCreated();
        $this->postJson("/api/job-offers/{$offer->id}/applications")->assertStatus(409);

        $this->assertDatabaseCount('applications', 1);
    }

    public function test_cannot_apply_to_an_offer_that_is_not_published(): void
    {
        $company = $this->makeCompany();
        $paused = JobOffer::factory()->for($company)->paused()->create();
        $blocked = JobOffer::factory()->for($company)->blocked()->create();
        $this->actingAsProfessional();

        $this->postJson("/api/job-offers/{$paused->id}/applications")->assertNotFound();
        $this->postJson("/api/job-offers/{$blocked->id}/applications")->assertNotFound();
    }

    public function test_application_list_is_paginated_and_only_shows_my_own(): void
    {
        $me = $this->actingAsProfessional();
        Application::factory(3)->create(['professional_id' => $me->id]);
        Application::factory(2)->create(); // de otras personas

        $this->getJson('/api/applications?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonStructure(['data' => [['id', 'status', 'applied_at', 'offer' => ['id', 'title', 'company']]]]);
    }

    // ---- Favoritos ------------------------------------------------------------------------

    public function test_offers_can_be_saved_listed_and_removed(): void
    {
        $offer = $this->makeOffer($this->makeCompany(), ['PHP']);
        $me = $this->actingAsProfessional();

        $this->postJson("/api/job-offers/{$offer->id}/favorite")->assertOk();
        $this->postJson("/api/job-offers/{$offer->id}/favorite")->assertOk(); // no falla si ya estaba
        $this->assertSame(1, Favorite::where('professional_id', $me->id)->count());

        $this->getJson('/api/favorites')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $offer->id)
            ->assertJsonPath('data.0.saved', true);

        $this->deleteJson("/api/job-offers/{$offer->id}/favorite")->assertNoContent();
        $this->assertSame(0, Favorite::where('professional_id', $me->id)->count());
        $this->getJson('/api/favorites')->assertJsonCount(0, 'data');
    }

    public function test_cannot_save_an_unpublished_offer_and_paused_ones_are_hidden_from_favorites(): void
    {
        $company = $this->makeCompany();
        $offer = JobOffer::factory()->for($company)->create();
        $paused = JobOffer::factory()->for($company)->paused()->create();
        $me = $this->actingAsProfessional();

        $this->postJson("/api/job-offers/{$paused->id}/favorite")->assertNotFound();

        Favorite::create(['professional_id' => $me->id, 'job_offer_id' => $offer->id]);
        $offer->update(['status' => JobOffer::STATUS_PAUSED]); // se pausa después de guardarla

        $this->getJson('/api/favorites')->assertJsonCount(0, 'data');
    }
}
