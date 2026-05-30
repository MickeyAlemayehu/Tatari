<?php

use App\Models\Employee;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('notifications.{employeeId}', function (Employee $employee, int $employeeId) {
    return (int) $employee->id === $employeeId;
});
