<?php

namespace App\Events;

use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeaveRequestRejected
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public LeaveRequest $leaveRequest,
        public Employee $approver,
        public ?string $reason = null
    ) {}
}
