<?php

namespace App\Events;

use App\Models\Applicant;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ApplicantStatusChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Applicant $applicant,
        public string $previousStatus,
        public string $newStatus,
        public ?int $reviewerId = null
    ) {}
}
