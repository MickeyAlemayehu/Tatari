<?php

use App\Http\Controllers\ApiAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json(['message' => 'API is up']);
});

Route::post('/login', [ApiAuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [ApiAuthController::class, 'logout']);
    Route::get('/me', [ApiAuthController::class, 'me']);

    Route::get('/admin/payroll', function () {
        return response()->json(['message' => 'Payroll management API access granted']);
    })->middleware('employee.permission:5,manage_payroll');
});
