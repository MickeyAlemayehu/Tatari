<?php

use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PerformanceReviewController;
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

    // Performance reviews API
    Route::get('/performance-reviews', [PerformanceReviewController::class, 'index']);
    Route::post('/performance-reviews', [PerformanceReviewController::class, 'store']);
    Route::get('/performance-reviews/{performanceReview}', [PerformanceReviewController::class, 'show']);
    Route::patch('/performance-reviews/{performanceReview}', [PerformanceReviewController::class, 'update']);
    Route::post('/performance-reviews/{performanceReview}/submit', [PerformanceReviewController::class, 'submit']);
    Route::post('/performance-reviews/{performanceReview}/complete', [PerformanceReviewController::class, 'complete']);

    // Employee management API (admin)
    Route::middleware('employee.permission:6,manage_employees')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
        Route::patch('/employees/{employee}', [EmployeeController::class, 'update']);
        Route::post('/employees/{employee}/deactivate', [EmployeeController::class, 'deactivate']);
    });
});
