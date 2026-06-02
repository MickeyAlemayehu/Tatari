<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Notification;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $manager = Employee::where('email', 'manager@tatari.local')->first();
        $staff = Employee::where('email', 'staff@tatari.local')->first();

        if ($manager) {
            $this->notify($manager, 'New Leave Request', 'Selamawit Bekele has submitted a leave request for May 15-19.', 'leave');
            $this->notify($manager, 'New Job Application', 'A new candidate applied for Senior Software Engineer.', 'recruitment');
            $this->notify($manager, 'Performance Review Due', 'Performance reviews are due this week.', 'performance', true);
        }

        if ($staff) {
            $this->notify($staff, 'Leave Request Submitted', 'Your annual leave request is pending approval.', 'leave');
            $this->notify($staff, 'Performance Review Updated', 'Your 2026 H1 performance review has been updated.', 'performance', true);
        }
    }

    private function notify(Employee $employee, string $title, string $message, string $type, bool $read = false): void
    {
        Notification::updateOrCreate(
            [
                'recipient_type' => Employee::class,
                'recipient_id' => $employee->id,
                'title' => $title,
            ],
            [
                'message' => $message,
                'notification_type' => $type,
                'is_read' => $read,
            ]
        );
    }
}
