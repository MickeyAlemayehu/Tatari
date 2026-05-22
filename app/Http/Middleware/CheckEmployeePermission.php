<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEmployeePermission
{
    /**
     * Require an authenticated employee with a specific permission (from level config + overrides).
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $employee = $request->user('api') ?? $request->user();

        if (! $employee) {
            abort(Response::HTTP_UNAUTHORIZED, 'Unauthenticated.');
        }

        if (! $employee->hasPermission($permission)) {
            abort(Response::HTTP_FORBIDDEN, 'Permission denied.');
        }

        return $next($request);
    }
}
