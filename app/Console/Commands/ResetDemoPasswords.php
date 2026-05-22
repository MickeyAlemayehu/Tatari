<?php

namespace App\Console\Commands;

use App\Models\Employee;
use Illuminate\Console\Command;

class ResetDemoPasswords extends Command
{
    protected $signature = 'employees:reset-demo-passwords {--password=Password123!}';

    protected $description = 'Reset demo employee passwords in the database (fixes double-hashed seed data)';

    public function handle(): int
    {
        $password = (string) $this->option('password');
        $emails = [
            'admin@tatari.local',
            'admin@example.com',
            'manager@tatari.local',
            'staff@tatari.local',
            'revoked@tatari.local',
            'override@tatari.local',
        ];

        $updated = 0;
        foreach ($emails as $email) {
            $employee = Employee::query()->whereRaw('LOWER(email) = ?', [strtolower($email)])->first();
            if (! $employee) {
                $this->warn("Skipped (not found): {$email}");
                continue;
            }

            $employee->password = $password;
            $employee->save();
            $updated++;
            $this->line("Updated: {$email}");
        }

        $this->info("Reset {$updated} password(s). Use: {$password}");

        return self::SUCCESS;
    }
}
