<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobOffer;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/** Números del panel de administración. */
class StatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $byModeration = JobOffer::selectRaw('moderation_status, COUNT(*) as total')
            ->groupBy('moderation_status')
            ->pluck('total', 'moderation_status');

        return response()->json(['data' => [
            'offers' => [
                'pending' => (int) $byModeration->get(JobOffer::MODERATION_PENDING, 0),
                'approved' => (int) $byModeration->get(JobOffer::MODERATION_APPROVED, 0),
                'blocked' => (int) $byModeration->get(JobOffer::MODERATION_BLOCKED, 0),
            ],
            'applications' => Application::count(),
            'users' => User::count(),
            'skills' => Skill::count(),
        ]]);
    }
}
