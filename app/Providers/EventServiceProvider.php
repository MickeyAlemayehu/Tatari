<?php

namespace App\Providers;

use App\Events\ApplicantStatusChanged;
use App\Events\EmployeeCreated;
use App\Events\EmployeeDeactivated;
use App\Events\EmployeePasswordChanged;
use App\Events\EvaluationPeriodActivated;
use App\Events\EvaluationSubmitted;
use App\Events\EvaluatorsAssigned;
use App\Events\InterviewScheduled;
use App\Events\LeaveRequestApproved;
use App\Events\LeaveRequestCancelled;
use App\Events\LeaveRequestRejected;
use App\Events\LeaveRequestSubmitted;
use App\Listeners\SendApplicantStatusNotification;
use App\Listeners\SendEmployeeCreatedNotification;
use App\Listeners\SendEmployeeDeactivatedNotification;
use App\Listeners\SendEmployeePasswordChangedNotification;
use App\Listeners\SendEvaluationPeriodActivatedNotification;
use App\Listeners\SendEvaluationSubmittedNotification;
use App\Listeners\SendEvaluatorAssignmentNotification;
use App\Listeners\SendInterviewScheduledNotification;
use App\Listeners\SendLeaveApprovedNotification;
use App\Listeners\SendLeaveCancelledNotification;
use App\Listeners\SendLeaveRejectedNotification;
use App\Listeners\SendLeaveSubmittedNotifications;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        LeaveRequestSubmitted::class      => [SendLeaveSubmittedNotifications::class.'@handle'],
        LeaveRequestApproved::class       => [SendLeaveApprovedNotification::class.'@handle'],
        LeaveRequestRejected::class       => [SendLeaveRejectedNotification::class.'@handle'],
        LeaveRequestCancelled::class      => [SendLeaveCancelledNotification::class.'@handle'],

        ApplicantStatusChanged::class     => [SendApplicantStatusNotification::class.'@handle'],
        InterviewScheduled::class         => [SendInterviewScheduledNotification::class.'@handle'],

        EvaluatorsAssigned::class         => [SendEvaluatorAssignmentNotification::class.'@handle'],
        EvaluationSubmitted::class        => [SendEvaluationSubmittedNotification::class.'@handle'],
        EvaluationPeriodActivated::class  => [SendEvaluationPeriodActivatedNotification::class.'@handle'],

        EmployeeCreated::class            => [SendEmployeeCreatedNotification::class.'@handle'],
        EmployeeDeactivated::class        => [SendEmployeeDeactivatedNotification::class.'@handle'],
        EmployeePasswordChanged::class    => [SendEmployeePasswordChangedNotification::class.'@handle'],
    ];

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
