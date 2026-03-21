<?php

use App\Http\Controllers\AuthController;
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
    })->name('dashboard');

    Route::get('/admin/payroll', function () {
        return response()->json(['message' => 'Payroll management access granted']);
    })->middleware('employee.permission:5,manage_payroll');
});
