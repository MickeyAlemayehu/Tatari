<?php

namespace App\Mail;

use App\Models\Applicant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicantStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Applicant $applicant, public string $status)
    {
    }

    public function envelope(): Envelope
    {
        $companyName = $this->companyName();
        $from = config('mail.from.address');
        $fromName = $companyName;

        $envelope = new Envelope(
            subject: $this->subjectFor($this->status, $companyName),
            to: [new Address($this->applicant->email, trim("{$this->applicant->first_name} {$this->applicant->last_name}"))],
        );

        if (is_string($from) && $from !== '') {
            $envelope = $envelope->from(new Address($from, $fromName));
        }

        return $envelope;
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.applicant-status',
            with: [
                'applicant'   => $this->applicant,
                'status'      => $this->status,
                'jobTitle'    => $this->applicant->vacancy?->title ?? 'the role',
                'companyName' => $this->companyName(),
                'interviewAt' => $this->applicant->interview_at,
            ],
        );
    }

    private function companyName(): string
    {
        return (string) (env('COMPANY_NAME') ?: config('mail.from.name') ?: config('app.name', 'Our Company'));
    }

    private function subjectFor(string $status, string $companyName): string
    {
        return match ($status) {
            'hired'              => "Your Application Has Been Accepted — {$companyName}",
            'rejected'           => "Update on Your Application — {$companyName}",
            'shortlisted'        => "Update on Your Application — {$companyName}",
            'interview_scheduled' => "Interview Scheduled — {$companyName}",
            default              => "Update on Your Application — {$companyName}",
        };
    }
}
