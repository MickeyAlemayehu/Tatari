<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $companyName }}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px;">
    <p>Dear {{ $applicant->first_name }} {{ $applicant->last_name }},</p>

    @switch($status)
        @case('hired')
            <p>
                Congratulations! We are pleased to inform you that your application for the
                <strong>{{ $jobTitle }}</strong> position at {{ $companyName }} has been
                <strong>accepted</strong>.
            </p>
            <p>
                Our team will be in touch shortly with the next steps for onboarding,
                including paperwork, start date, and any additional details you'll need.
                In the meantime, please feel free to reach out to us if you have any questions.
            </p>
            <p>
                Welcome aboard — we're excited to have you join {{ $companyName }}.
            </p>
            @break

        @case('rejected')
            <p>
                Thank you for your interest in the <strong>{{ $jobTitle }}</strong> position
                at {{ $companyName }} and for taking the time to apply.
            </p>
            <p>
                After careful consideration, we have decided to move forward with other
                candidates whose experience more closely matches our current needs. This
                was a difficult decision, as we received many strong applications.
            </p>
            <p>
                We genuinely appreciate the time and effort you invested in your application
                and encourage you to apply for future roles that match your background. We
                wish you the very best in your job search and your career.
            </p>
            @break

        @case('shortlisted')
            <p>
                Thank you for applying for the <strong>{{ $jobTitle }}</strong> position
                at {{ $companyName }}.
            </p>
            <p>
                Your application has been placed on our <strong>waitlist</strong>. While we
                are not able to move forward with your application at this exact moment, we
                were impressed by your background and will reach out promptly if a suitable
                position becomes available.
            </p>
            <p>
                We appreciate your patience and your continued interest in {{ $companyName }}.
            </p>
            @break

        @case('interview_scheduled')
            <p>
                Thank you for your application for the <strong>{{ $jobTitle }}</strong>
                position at {{ $companyName }}. We were impressed with your background
                and would like to invite you to an interview.
            </p>

            @if ($interviewAt)
                <p>
                    <strong>Interview details:</strong><br>
                    Date &amp; time: {{ $interviewAt->format('l, F j, Y \a\t g:i A') }}
                </p>
            @endif

            <p>
                You will receive a separate email with the meeting link or location and
                any preparation materials. If the proposed time does not work for you,
                please reply to this email and we'll arrange an alternative.
            </p>
            <p>
                We look forward to meeting you.
            </p>
            @break

        @default
            <p>
                There has been an update to your application for the
                <strong>{{ $jobTitle }}</strong> position at {{ $companyName }}.
                Please get in touch if you'd like additional details.
            </p>
    @endswitch

    <p style="margin-top: 32px;">
        Best regards,<br>
        The {{ $companyName }} Recruiting Team
    </p>

    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
    <p style="font-size: 12px; color: #6B7280;">
        This is an automated message from {{ $companyName }}. Please do not reply to this
        address unless instructed otherwise.
    </p>
</body>
</html>
