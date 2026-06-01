<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $companyName }}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px;">
    <p>Dear {{ $employee->first_name }} {{ $employee->last_name }},</p>

    <p>
        Welcome to <strong>{{ $companyName }}</strong>! Your employee account has been created
        and you can now access the HR portal.
    </p>

    <p>Here are your login credentials:</p>

    <table style="border-collapse: collapse; margin: 16px 0; width: 100%;">
        <tr>
            <td style="padding: 10px 16px; background: #F9FAFB; border: 1px solid #E5E7EB; font-weight: 600; width: 140px;">Email</td>
            <td style="padding: 10px 16px; background: #FFFFFF; border: 1px solid #E5E7EB;">{{ $employee->email }}</td>
        </tr>
        <tr>
            <td style="padding: 10px 16px; background: #F9FAFB; border: 1px solid #E5E7EB; font-weight: 600;">Password</td>
            <td style="padding: 10px 16px; background: #FFFFFF; border: 1px solid #E5E7EB;"><code style="background: #EEF2FF; padding: 2px 8px; border-radius: 4px; color: #4F46E5;">{{ $password }}</code></td>
        </tr>
    </table>

    <p>
        <a href="{{ $loginUrl }}"
           style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Log In to Your Account
        </a>
    </p>

    <p style="color: #EF4444; font-weight: 600;">
        ⚠️ For security reasons, please change your password immediately after your first login.
    </p>

    <p>
        If you have any questions or need assistance, please don't hesitate to reach out to
        the HR team.
    </p>

    <p style="margin-top: 32px;">
        Best regards,<br>
        The {{ $companyName }} Team
    </p>

    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
    <p style="font-size: 12px; color: #6B7280;">
        This is an automated message from {{ $companyName }}. Please do not reply to this
        address unless instructed otherwise.
    </p>
</body>
</html>
