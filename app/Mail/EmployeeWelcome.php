<?php

namespace App\Mail;

use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmployeeWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Employee $employee,
        public string $defaultPassword = 'defaultpassword123',
    ) {}

    public function envelope(): Envelope
    {
        $companyName = $this->companyName();
        $from = config('mail.from.address');

        $envelope = new Envelope(
            subject: "Welcome to {$companyName} — Your Account Details",
            to: [new Address($this->employee->email, trim("{$this->employee->first_name} {$this->employee->last_name}"))],
        );

        if (is_string($from) && $from !== '') {
            $envelope = $envelope->from(new Address($from, $companyName));
        }

        return $envelope;
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.employee-welcome',
            with: [
                'employee'    => $this->employee,
                'password'    => $this->defaultPassword,
                'loginUrl'    => $this->loginUrl(),
                'companyName' => $this->companyName(),
            ],
        );
    }

    private function companyName(): string
    {
        return (string) (env('COMPANY_NAME') ?: config('mail.from.name') ?: config('app.name', 'Our Company'));
    }

    private function loginUrl(): string
    {
        // Use the frontend URL; fall back to APP_URL with the /login path
        $base = rtrim(env('FRONTEND_URL', config('app.url', 'http://localhost:5173')), '/');
        return $base . '/login';
    }
}
