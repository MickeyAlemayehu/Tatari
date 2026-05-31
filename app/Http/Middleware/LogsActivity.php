<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AuditLog;
use Illuminate\Support\Str;
use App\Services\AuditActionMapper;

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

            $path = $request->path();

            // Ignore technical and internal requests
            if (
                $request->is('broadcasting/auth') ||
                $request->is('reverb/*') ||
                $request->is('up') ||
                $request->is('sanctum/csrf-cookie') ||
                $request->is('_debugbar/*') ||
                $request->is('build/*') ||
                Str::contains($path, 'polling') ||
                Str::contains($path, 'keep-alive') ||
                Str::contains($path, 'refresh')
            ) {
                return;
            }

            // Skip login/logout as they are handled manually in ApiAuthController
            if (Str::contains($path, 'login') || Str::contains($path, 'logout')) {
                return;
            }

            // Prevent duplicate logging if manual log was inserted.
            if ($request->attributes->has('skip_audit_log') || $request->attributes->has('audit_logged')) {
                return;
            }

            $mappedAction = AuditActionMapper::map($request);

            if (! $mappedAction) {
                return; // Do not log if mapper explicitly ignored it
            }

            $status = $response->isSuccessful() ? 'success' : ($response->isClientError() ? 'warning' : 'failed');

            AuditLog::record(
                action: $mappedAction['action'],
                module: $mappedAction['module'],
                description: $mappedAction['description'],
                employee: $request->user(),
                status: $status
            );
        }
    }
}
