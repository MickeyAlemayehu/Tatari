<?php

use App\Http\Middleware\CheckEmployeePermission;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['middleware' => ['api', 'auth:api']]
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'employee.permission' => CheckEmployeePermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], Response::HTTP_UNAUTHORIZED);
            }
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => $exception->getMessage() ?: 'Forbidden.',
                ], Response::HTTP_FORBIDDEN);
            }
        });

        $exceptions->render(function (HttpException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $status = $exception->getStatusCode();
            $defaults = [
                Response::HTTP_FORBIDDEN => 'You are not authorized to perform this action.',
                Response::HTTP_NOT_FOUND => 'Resource not found.',
                Response::HTTP_METHOD_NOT_ALLOWED => 'Method not allowed.',
            ];

            return response()->json([
                'message' => $exception->getMessage() ?: ($defaults[$status] ?? 'Request failed.'),
            ], $status);
        });
    })->create();
