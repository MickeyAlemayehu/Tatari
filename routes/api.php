<?php

use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\ApplicantController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CompensationController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\JobVacancyController;
use App\Http\Controllers\LeaveManagementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PerformanceEvaluationWorkflowController;
use App\Http\Controllers\PerformanceReviewController;
use App\Http\Controllers\EvaluationTemplateController;
use App\Http\Controllers\PermissionController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json(['message' => 'API is up']);
});

Route::post('/login', [ApiAuthController::class, 'login']);

Route::get('/public/jobs', [JobVacancyController::class, 'publicIndex']);
Route::get('/public/jobs/{jobVacancy}', [JobVacancyController::class, 'publicShow']);
Route::post('/public/jobs/{jobVacancy}/apply', [ApplicantController::class, 'apply']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [ApiAuthController::class, 'logout']);
    Route::get('/me', [ApiAuthController::class, 'me']);
    Route::post('/me/password', [ApiAuthController::class, 'changePassword']);
    Route::get('/me/department', [DepartmentController::class, 'mine']);

    Route::middleware('employee.permission:access_employee_portal')->group(function () {
        Route::get('/leave-types', [LeaveManagementController::class, 'types']);
        Route::get('/leave-requests/my', [LeaveManagementController::class, 'mine']);
        Route::post('/leave-requests', [LeaveManagementController::class, 'store']);
        Route::get('/leave-requests/{leaveRequest}', [LeaveManagementController::class, 'show']);
        Route::post('/leave-requests/{leaveRequest}/cancel', [LeaveManagementController::class, 'cancel']);
        Route::get('/leave-balances/my', [LeaveManagementController::class, 'myBalances']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/read', [NotificationController::class, 'clearRead']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

        Route::get('/evaluation-assignments/my', [PerformanceEvaluationWorkflowController::class, 'myAssignments']);
        Route::get('/performance-results/my', [PerformanceEvaluationWorkflowController::class, 'myResults']);

        // Employee-facing: fetch questions for an assignment's template
        Route::get('/evaluation-questions/for-assignment/{assignment}', [PerformanceEvaluationWorkflowController::class, 'questionsForAssignment']);

    });

    Route::middleware('employee.permission:access_admin_portal')->group(function () {
        Route::get('/companies', [CompanyController::class, 'index']);
        Route::get('/companies/{company}', [CompanyController::class, 'show']);
        Route::patch('/companies/{company}', [CompanyController::class, 'update']);
        
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/audit-logs/modules', [AuditLogController::class, 'modules']);
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

    Route::post('/evaluation-assignments/{assignment}/submit', [PerformanceEvaluationWorkflowController::class, 'submitEvaluation'])
        ->middleware('employee.permission:access_employee_portal');

    // Employee management API (admin)
    Route::middleware('employee.permission:manage_employees')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::get('/employees/import/template', [EmployeeController::class, 'importTemplate']);
        Route::post('/employees/import', [EmployeeController::class, 'import']);
        Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
        Route::patch('/employees/{employee}', [EmployeeController::class, 'update']);
        Route::post('/employees/{employee}/deactivate', [EmployeeController::class, 'deactivate']);
        Route::get('/employees/{employee}/compensations', [CompensationController::class, 'forEmployee']);

        Route::get('/departments', [DepartmentController::class, 'index']);
        Route::post('/departments', [DepartmentController::class, 'store']);
        Route::get('/departments/{department}', [DepartmentController::class, 'show']);
        Route::get('/departments/{department}/employees', [DepartmentController::class, 'employees']);
        Route::patch('/departments/{department}', [DepartmentController::class, 'update']);
        Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);
    });

    Route::middleware('employee.permission:approve_leave')->group(function () {
        Route::get('/leave-summary', [LeaveManagementController::class, 'summary']);
        Route::get('/leave-requests', [LeaveManagementController::class, 'index']);
        Route::get('/leave-balances', [LeaveManagementController::class, 'balances']);
        Route::post('/leave-requests/{leaveRequest}/approve', [LeaveManagementController::class, 'approve']);
        Route::post('/leave-requests/{leaveRequest}/reject', [LeaveManagementController::class, 'reject']);
    });

    Route::middleware('employee.permission:manage_employees')->group(function () {
        Route::get('/job-vacancies', [JobVacancyController::class, 'index']);
        Route::post('/job-vacancies', [JobVacancyController::class, 'store']);
        Route::get('/job-vacancies/{jobVacancy}', [JobVacancyController::class, 'show']);
        Route::patch('/job-vacancies/{jobVacancy}', [JobVacancyController::class, 'update']);
        Route::delete('/job-vacancies/{jobVacancy}', [JobVacancyController::class, 'destroy']);

        Route::get('/applicants', [ApplicantController::class, 'index']);
        Route::get('/applicants/{applicant}', [ApplicantController::class, 'show']);
        Route::get('/applicants/{applicant}/resume/download', [ApplicantController::class, 'downloadResume']);
        Route::patch('/applicants/{applicant}', [ApplicantController::class, 'update']);
    });

    Route::middleware('employee.permission:performance_create')->group(function () {
        Route::get('/evaluation-periods', [PerformanceEvaluationWorkflowController::class, 'periods']);
        Route::post('/evaluation-periods', [PerformanceEvaluationWorkflowController::class, 'storePeriod']);
        Route::get('/evaluation-periods/{period}', [PerformanceEvaluationWorkflowController::class, 'getPeriod']);
        Route::put('/evaluation-periods/{period}', [PerformanceEvaluationWorkflowController::class, 'updatePeriod']);
        Route::post('/evaluation-periods/{period}/activate', [PerformanceEvaluationWorkflowController::class, 'activatePeriod']);
        Route::get('/evaluation-assignments', [PerformanceEvaluationWorkflowController::class, 'assignments']);
        Route::get('/evaluation-assignments/for-employee', [PerformanceEvaluationWorkflowController::class, 'assignmentsForEmployeeInPeriod']);
        Route::post('/evaluation-assignments/upsert-for-employee', [PerformanceEvaluationWorkflowController::class, 'upsertEvaluatorsForEmployee']);
        // Legacy alias — keeps old callers working
        Route::post('/evaluation-assignments/assign-peers', [PerformanceEvaluationWorkflowController::class, 'upsertEvaluatorsForEmployee']);
        Route::get('/performance-results', [PerformanceEvaluationWorkflowController::class, 'results']);

        // Evaluation template CRUD
        Route::get('/evaluation-templates', [EvaluationTemplateController::class, 'index']);
        Route::post('/evaluation-templates', [EvaluationTemplateController::class, 'store']);
        Route::get('/evaluation-templates/{template}', [EvaluationTemplateController::class, 'show']);
        Route::patch('/evaluation-templates/{template}', [EvaluationTemplateController::class, 'update']);
        Route::delete('/evaluation-templates/{template}', [EvaluationTemplateController::class, 'destroy']);
        Route::post('/evaluation-templates/{template}/activate', [EvaluationTemplateController::class, 'activate']);
        Route::post('/evaluation-templates/{template}/deactivate', [EvaluationTemplateController::class, 'deactivate']);

        // Evaluation question CRUD
        Route::get('/evaluation-questions', [EvaluationTemplateController::class, 'questions']);
        Route::post('/evaluation-questions', [EvaluationTemplateController::class, 'storeQuestion']);
        Route::get('/evaluation-questions/{question}', [EvaluationTemplateController::class, 'showQuestion']);
        Route::patch('/evaluation-questions/{question}', [EvaluationTemplateController::class, 'updateQuestion']);
        Route::delete('/evaluation-questions/{question}', [EvaluationTemplateController::class, 'destroyQuestion']);
        Route::post('/evaluation-questions/reorder', [EvaluationTemplateController::class, 'reorderQuestions']);
    });

    Route::middleware('employee.permission:manage_employees')->group(function () {
        Route::get('/compensations', [CompensationController::class, 'index']);
        Route::post('/compensations', [CompensationController::class, 'store']);
        Route::get('/compensations/{compensation}', [CompensationController::class, 'show']);
        Route::patch('/compensations/{compensation}', [CompensationController::class, 'update']);
        Route::delete('/compensations/{compensation}', [CompensationController::class, 'destroy']);
    });

    // Permission management (admin only)
    Route::middleware('employee.permission:access_admin_portal')->group(function () {
        Route::get('/permissions/available', [PermissionController::class, 'getAvailablePermissions']);
        Route::patch('/employees/{employee}/permission-level', [PermissionController::class, 'updatePermissionLevel']);
        Route::post('/employees/{employee}/permissions/grant', [PermissionController::class, 'grantPermission']);
        Route::post('/employees/{employee}/permissions/revoke', [PermissionController::class, 'revokePermission']);
        Route::delete('/employees/{employee}/permissions/granted/{permission}', [PermissionController::class, 'removeGrantedPermission']);
        Route::delete('/employees/{employee}/permissions/revoked/{permission}', [PermissionController::class, 'removeRevokedPermission']);
    });
});
