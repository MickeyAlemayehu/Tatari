<?php

namespace App\Events;

use App\Models\Employee;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmployeeDeactivated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public Employee $employee) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.' . $this->employee->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'employee.deactivated';
    }
}
