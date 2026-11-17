<?php

namespace App\Http\Resources\Concerns;

use Carbon\CarbonInterface;

trait FormatsDates
{
    /** Días enteros transcurridos desde la fecha (0 = hoy). */
    protected function daysSince(?CarbonInterface $date): ?int
    {
        return $date ? (int) $date->diffInDays(now(), true) : null;
    }
}
