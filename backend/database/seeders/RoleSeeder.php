<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([Role::ADMIN, Role::PROFESSIONAL, Role::COMPANY] as $name) {
            Role::firstOrCreate(['name' => $name]);
        }
    }
}
