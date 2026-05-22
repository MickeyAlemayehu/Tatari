<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PerformanceReviewController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/dashboard');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.perform');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', function () {
        $employee = auth()->user();

        return response()->json([
            'message' => 'Authenticated employee dashboard',
            'employee' => [
                'id' => $employee->id,
                'email' => $employee->email,
                'permission_level' => $employee->permission_level,
            ],
        ]);
    })->middleware('employee.permission:access_employee_portal')->name('dashboard');

    Route::get('/admin/payroll', function () {
        return response()->json(['message' => 'Payroll management access granted']);
    })->middleware('employee.permission:manage_payroll');

    // Employee management (admin)
    Route::middleware('employee.permission:manage_employees')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
        Route::patch('/employees/{employee}', [EmployeeController::class, 'update']);
        Route::post('/employees/{employee}/deactivate', [EmployeeController::class, 'deactivate']);
    });

    Route::middleware('employee.permission:access_employee_portal')->group(function () {
        Route::get('/performance-reviews', [PerformanceReviewController::class, 'index']);
        Route::post('/performance-reviews', [PerformanceReviewController::class, 'store']);
        Route::get('/performance-reviews/{performanceReview}', [PerformanceReviewController::class, 'show']);
        Route::post('/performance-reviews/{performanceReview}/submit', [PerformanceReviewController::class, 'submit']);
    });

    Route::middleware('employee.permission:manage_performance_reviews')->group(function () {
        Route::patch('/performance-reviews/{performanceReview}', [PerformanceReviewController::class, 'update']);
        Route::post('/performance-reviews/{performanceReview}/complete', [PerformanceReviewController::class, 'complete']);
    });
});
