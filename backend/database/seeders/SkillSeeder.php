<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            'PHP', 'Laravel', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Node.js',
            'Python', 'Java', 'C#', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker',
            'Git', 'AWS', 'Linux', 'HTML', 'CSS', 'Tailwind CSS', 'Figma', 'Testing',
            'Scrum', 'Inglés',
        ];

        foreach ($skills as $name) {
            Skill::firstOrCreate(['name' => $name]);
        }
    }
}
