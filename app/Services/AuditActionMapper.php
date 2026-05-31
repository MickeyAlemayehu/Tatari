<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuditActionMapper
{
    /**
     * Map a technical request to a user-friendly business action.
     * Returns an array with 'action', 'module', and 'description' or null if not mapped.
     *
     * @param Request $request
     * @return array|null
     */
    public static function map(Request $request): ?array
    {
        $route = $request->route();
        if (! $route) {
            return null;
        }

        $actionName = $route->getActionName();

        // Mapping controller actions to user-friendly terminology
        $mapping = [
            // Employee Management
            'App\Http\Controllers\EmployeeController@store' => ['action' => 'Added employee', 'module' => 'Employee Management'],
            'App\Http\Controllers\EmployeeController@update' => ['action' => 'Updated employee profile', 'module' => 'Employee Management'],
            'App\Http\Controllers\EmployeeController@deactivate' => ['action' => 'Deactivated employee', 'module' => 'Employee Management'],
            'App\Http\Controllers\EmployeeController@import' => ['action' => 'Imported employees', 'module' => 'Employee Management'],
            
            // Departments
            'App\Http\Controllers\DepartmentController@store' => ['action' => 'Created department', 'module' => 'Employee Management'],
            'App\Http\Controllers\DepartmentController@update' => ['action' => 'Updated department', 'module' => 'Employee Management'],
            'App\Http\Controllers\DepartmentController@destroy' => ['action' => 'Removed department', 'module' => 'Employee Management'],

            // Compensation
            'App\Http\Controllers\CompensationController@store' => ['action' => 'Added compensation record', 'module' => 'Employee Management'],
            'App\Http\Controllers\CompensationController@update' => ['action' => 'Updated compensation record', 'module' => 'Employee Management'],
            'App\Http\Controllers\CompensationController@destroy' => ['action' => 'Removed compensation record', 'module' => 'Employee Management'],

            // Leave Management
            'App\Http\Controllers\LeaveManagementController@store' => ['action' => 'Submitted leave request', 'module' => 'Leave Management'],
            'App\Http\Controllers\LeaveManagementController@cancel' => ['action' => 'Cancelled leave request', 'module' => 'Leave Management'],
            'App\Http\Controllers\LeaveManagementController@approve' => ['action' => 'Approved leave request', 'module' => 'Leave Management'],
            'App\Http\Controllers\LeaveManagementController@reject' => ['action' => 'Rejected leave request', 'module' => 'Leave Management'],

            // Job Vacancies & Applicants
            'App\Http\Controllers\JobVacancyController@store' => ['action' => 'Published job opening', 'module' => 'Recruitment'],
            'App\Http\Controllers\JobVacancyController@update' => ['action' => 'Updated job opening', 'module' => 'Recruitment'],
            'App\Http\Controllers\JobVacancyController@destroy' => ['action' => 'Removed job opening', 'module' => 'Recruitment'],
            'App\Http\Controllers\ApplicantController@apply' => ['action' => 'Submitted job application', 'module' => 'Recruitment'],
            'App\Http\Controllers\ApplicantController@update' => ['action' => 'Updated applicant status', 'module' => 'Recruitment'],

            // Performance Reviews & Evaluations
            'App\Http\Controllers\PerformanceReviewController@store' => ['action' => 'Submitted performance review', 'module' => 'Performance'],
            'App\Http\Controllers\PerformanceReviewController@submit' => ['action' => 'Submitted performance review', 'module' => 'Performance'],
            'App\Http\Controllers\PerformanceReviewController@update' => ['action' => 'Updated performance review', 'module' => 'Performance'],
            'App\Http\Controllers\PerformanceReviewController@complete' => ['action' => 'Completed performance review', 'module' => 'Performance'],
            
            'App\Http\Controllers\PerformanceEvaluationWorkflowController@storePeriod' => ['action' => 'Created evaluation period', 'module' => 'Performance'],
            'App\Http\Controllers\PerformanceEvaluationWorkflowController@activatePeriod' => ['action' => 'Activated evaluation period', 'module' => 'Performance'],
            'App\Http\Controllers\PerformanceEvaluationWorkflowController@upsertEvaluatorsForEmployee' => ['action' => 'Assigned evaluators', 'module' => 'Performance'],
            'App\Http\Controllers\PerformanceEvaluationWorkflowController@submitEvaluation' => ['action' => 'Submitted evaluation', 'module' => 'Performance'],

            'App\Http\Controllers\EvaluationTemplateController@store' => ['action' => 'Created evaluation template', 'module' => 'Performance'],
            'App\Http\Controllers\EvaluationTemplateController@update' => ['action' => 'Updated evaluation template', 'module' => 'Performance'],
            'App\Http\Controllers\EvaluationTemplateController@destroy' => ['action' => 'Removed evaluation template', 'module' => 'Performance'],
            'App\Http\Controllers\EvaluationTemplateController@activate' => ['action' => 'Activated evaluation template', 'module' => 'Performance'],
            'App\Http\Controllers\EvaluationTemplateController@deactivate' => ['action' => 'Deactivated evaluation template', 'module' => 'Performance'],
            'App\Http\Controllers\EvaluationTemplateController@storeQuestion' => ['action' => 'Added evaluation question', 'module' => 'Performance'],
            'App\Http\Controllers\EvaluationTemplateController@updateQuestion' => ['action' => 'Updated evaluation question', 'module' => 'Performance'],
            'App\Http\Controllers\EvaluationTemplateController@destroyQuestion' => ['action' => 'Removed evaluation question', 'module' => 'Performance'],
            'App\Http\Controllers\EvaluationTemplateController@reorderQuestions' => ['action' => 'Reordered evaluation questions', 'module' => 'Performance'],

            // Permissions
            'App\Http\Controllers\PermissionController@updatePermissionLevel' => ['action' => 'Changed user role', 'module' => 'Permissions'],
            'App\Http\Controllers\PermissionController@grantPermission' => ['action' => 'Granted permission', 'module' => 'Permissions'],
            'App\Http\Controllers\PermissionController@revokePermission' => ['action' => 'Revoked permission', 'module' => 'Permissions'],
            'App\Http\Controllers\PermissionController@removeGrantedPermission' => ['action' => 'Removed granted permission', 'module' => 'Permissions'],
            'App\Http\Controllers\PermissionController@removeRevokedPermission' => ['action' => 'Removed revoked permission', 'module' => 'Permissions'],

            // Authentication & Notifications
            'App\Http\Controllers\ApiAuthController@changePassword' => ['action' => 'Changed password', 'module' => 'System'],
            'App\Http\Controllers\ApiAuthController@login' => ['action' => 'Logged in', 'module' => 'System'],
            'App\Http\Controllers\ApiAuthController@logout' => ['action' => 'Logged out', 'module' => 'System'],
            
            'App\Http\Controllers\NotificationController@markAllAsRead' => ['action' => 'Marked all notifications as read', 'module' => 'System'],
            'App\Http\Controllers\NotificationController@clearRead' => ['action' => 'Cleared read notifications', 'module' => 'System'],
            'App\Http\Controllers\NotificationController@markAsRead' => ['action' => 'Marked notification as read', 'module' => 'System'],
            'App\Http\Controllers\NotificationController@destroy' => ['action' => 'Deleted notification', 'module' => 'System'],

            // Company
            'App\Http\Controllers\CompanyController@update' => ['action' => 'Updated company profile', 'module' => 'Company'],
        ];

        if (isset($mapping[$actionName])) {
            $mapped = $mapping[$actionName];
            $action = $mapped['action'];
            $module = $mapped['module'];
            $description = self::generateDescription($action, $request);
            
            return [
                'action' => $action,
                'module' => $module,
                'description' => $description,
            ];
        }

        // If not strictly mapped, generate a generic but friendly fallback, if possible
        return self::fallbackMapping($request);
    }

    /**
     * Generate a contextual description based on the action and request parameters.
     */
    private static function generateDescription(string $action, Request $request): string
    {
        // Try to extract an ID from the route if applicable to make it more descriptive
        $routeParameters = $request->route()->parameters();
        $idContext = '';
        
        if (!empty($routeParameters)) {
            $firstParam = reset($routeParameters);
            // If the parameter is an object (model), try to get its ID, otherwise use it directly
            $id = is_object($firstParam) ? ($firstParam->id ?? null) : $firstParam;
            if ($id) {
                $idContext = " (ID: {$id})";
            }
        }

        return $action . $idContext;
    }

    /**
     * Fallback mapping for non-specific routes to avoid technical terms like "Performed POST".
     */
    private static function fallbackMapping(Request $request): ?array
    {
        // Ignore GET, HEAD, OPTIONS
        if (in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
            return null;
        }

        $path = $request->path();
        
        // Define a generic module based on the path
        $module = 'System';
        if (Str::contains($path, 'employee')) $module = 'Employee Management';
        elseif (Str::contains($path, 'leave')) $module = 'Leave Management';
        elseif (Str::contains($path, 'performance') || Str::contains($path, 'evaluation')) $module = 'Performance';
        elseif (Str::contains($path, 'job') || Str::contains($path, 'applicant')) $module = 'Recruitment';
        elseif (Str::contains($path, 'compan')) $module = 'Company';
        elseif (Str::contains($path, 'permission')) $module = 'Permissions';
        elseif (Str::contains($path, 'department')) $module = 'Employee Management';

        // Friendly fallback actions
        $actionMap = [
            'POST' => 'Created record',
            'PUT' => 'Updated record',
            'PATCH' => 'Updated record',
            'DELETE' => 'Deleted record',
        ];

        $action = $actionMap[$request->method()] ?? 'Modified record';
        
        // Friendly fallback description
        $pathDesc = Str::replace('/', ' ', $path);
        // Remove api prefix if exists
        $pathDesc = Str::replace('api ', '', $pathDesc);
        
        $description = "{$action} in " . Str::title($pathDesc);

        return [
            'action' => $action,
            'module' => $module,
            'description' => $description,
        ];
    }
}
