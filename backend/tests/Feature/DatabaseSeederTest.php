<?php

namespace Tests\Feature;

use App\Models\JobOffer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_creates_one_account_per_user_type(): void
    {
        $this->seed();

        $this->assertSame(Role::ADMIN, User::where('email', 'admin@careertrack.test')->first()->role->name);
        $this->assertSame(Role::PROFESSIONAL, User::where('email', 'profesional@careertrack.test')->first()->role->name);
        $this->assertSame(Role::COMPANY, User::where('email', 'empresa@careertrack.test')->first()->role->name);
        $this->assertFalse(User::where('email', 'inactivo@careertrack.test')->first()->isActive());
    }

    public function test_seeder_creates_offers_in_every_state(): void
    {
        $this->seed();

        $this->assertGreaterThan(0, JobOffer::published()->count());
        $this->assertGreaterThan(0, JobOffer::where('status', JobOffer::STATUS_PAUSED)->count());
        $this->assertGreaterThan(0, JobOffer::where('moderation_status', JobOffer::MODERATION_PENDING)->count());
        $this->assertGreaterThan(0, JobOffer::where('moderation_status', JobOffer::MODERATION_BLOCKED)->count());
    }
}
