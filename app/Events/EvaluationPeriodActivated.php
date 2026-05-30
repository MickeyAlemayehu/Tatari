<?php

namespace App\Events;

use App\Models\EvaluationPeriod;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EvaluationPeriodActivated
{
    use Dispatchable, SerializesModels;

    public function __construct(public EvaluationPeriod $period) {}
}
