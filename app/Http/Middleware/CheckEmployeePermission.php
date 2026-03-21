<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEmployeePermission
{
    public function handle(Request $request, Closure $next, int $requiredLevel = 0, ?string $permission = null): Response
    {
        $employee = $request->user('api') ?? $request->user();

        if (! $employee || ! $employee->hasRequiredLevel($requiredLevel)) {
            abort(Response::HTTP_FORBIDDEN, 'Insufficient permission level.');
        }

        if ($permission !== null && ! $employee->hasPermission($permission, $requiredLevel)) {
            abort(Response::HTTP_FORBIDDEN, 'Permission denied.');
        }

        return $next($request);
    }
}
