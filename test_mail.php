<?php

/**
 * SMTP smoke test for Tatari HRMS.
 *
 * Usage:
 *   php test_mail.php                          (sends to MAIL_USERNAME from .env)
 *   php test_mail.php someone@example.com     (sends to a specific address)
 *
 * Reads mail config from .env, attempts to send one plain-text email, and
 * prints either SENT_OK or the underlying error message. Delete this file
 * once Gmail SMTP is confirmed working.
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$to = $argv[1] ?? config('mail.mailers.smtp.username');

if (! $to) {
    echo "ERROR: no recipient. Pass one as the first argument or set MAIL_USERNAME in .env.\n";
    exit(1);
}

echo "Mailer  : ".config('mail.default')."\n";
echo "Host    : ".config('mail.mailers.smtp.host').":".config('mail.mailers.smtp.port')."\n";
echo "Scheme  : ".(config('mail.mailers.smtp.scheme') ?: '(none)')."\n";
echo "From    : ".config('mail.from.address')."\n";
echo "To      : {$to}\n";
echo "Sending...\n";

try {
    Illuminate\Support\Facades\Mail::raw(
        "SMTP smoke test from Tatari HRMS.\n\nIf you received this, Gmail SMTP is working and the automatic applicant status emails will go out the same way.",
        function ($message) use ($to) {
            $message->to($to)->subject('Tatari HRMS — SMTP smoke test');
        }
    );
    echo "SENT_OK\n";
    exit(0);
} catch (\Throwable $e) {
    echo "ERROR: ".$e->getMessage()."\n";
    exit(1);
}
