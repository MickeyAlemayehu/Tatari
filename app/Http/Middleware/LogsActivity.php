<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AuditLog;
use Illuminate\Support\Str;

class LogsActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        // Only log modifying requests
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            
            // Avoid logging if they aren't authenticated
            if (! $request->user()) {
                return;
            }

            // Determine generic module and action based on path
            $path = $request->path();
            
            // Skip login/logout as they are handled manually in ApiAuthController
            if (Str::contains($path, 'login') || Str::contains($path, 'logout')) {
                return;
            }

            $module = 'System';
            if (Str::contains($path, 'employee')) $module = 'Employee Management';
            elseif (Str::contains($path, 'leave')) $module = 'Leave Management';
            elseif (Str::contains($path, 'performance') || Str::contains($path, 'evaluation')) $module = 'Performance';
            elseif (Str::contains($path, 'job') || Str::contains($path, 'applicant')) $module = 'Recruitment';
            elseif (Str::contains($path, 'compan')) $module = 'Company';
            elseif (Str::contains($path, 'permission')) $module = 'Permissions';

            $actionMap = [
                'POST' => 'Created resource',
                'PUT' => 'Updated resource',
                'PATCH' => 'Updated resource',
                'DELETE' => 'Deleted resource',
            ];

            $action = $actionMap[$request->method()] ?? 'Modified resource';
            $status = $response->isSuccessful() ? 'success' : ($response->isClientError() ? 'warning' : 'failed');

            // Prevent duplicate logging if manual log was inserted. We can just add a generic log 
            // and maybe they overlap, but that's fine. For a cleaner approach, check if the request
            // explicitly set a skip flag.
            if ($request->attributes->has('skip_audit_log')) {
                return;
            }

            // If we didn't explicitly skip, we just log the generic action
            // Actually, we'll let manual logs set `skip_audit_log` so we don't double log.
            if (! $request->attributes->has('audit_logged')) {
                AuditLog::record(
                    action: $action,
                    module: $module,
                    description: "Performed {$request->method()} on /{$path}",
                    employee: $request->user(),
                    status: $status
                );
            }
        }
    }
}
