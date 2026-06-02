<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('api') ?? $request->user();

        if ($user && $user->status === 'inactive') {
            return response()->json([
                'message' => 'Your account has been deactivated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
