<?php

namespace App\Events;

use App\Models\EvaluationAssignment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EvaluatorsAssigned
{
    use Dispatchable, SerializesModels;

    /**
     * @param array<int, EvaluationAssignment> $assignments
     */
    public function __construct(public array $assignments) {}
}
