<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EvaluationAssignment;
use App\Models\EvaluationPeriod;
use App\Models\EvaluationTemplate;

class SelfEvaluationAutoAssigner
{
    /**
     * Create self-evaluation assignments for every active employee in the period's company.
     * Returns an array of warnings for employees that couldn't be matched to a self template.
     *
     * @return array<int, array{employee_id:int, employee_name:string, reason:string}>
     */
    public function assignFor(EvaluationPeriod $period): array
    {
        $warnings = [];

        $employees = Employee::query()
            ->with('department')
            ->where('status', 'active')
            ->whereHas('department', fn ($q) => $q->where('company_id', $period->company_id))
            ->get();

        foreach ($employees as $employee) {
            $template = $this->resolveSelfTemplate($period, $employee);

            if (! $template) {
                $warnings[] = [
                    'employee_id'   => $employee->id,
                    'employee_name' => trim("{$employee->first_name} {$employee->last_name}"),
                    'reason'        => 'no_self_template',
                ];
                continue;
            }

            EvaluationAssignment::updateOrCreate(
                [
                    'evaluation_period_id' => $period->id,
                    'employee_id'          => $employee->id,
                    'evaluator_id'         => $employee->id,
                    'evaluator_type'       => 'self',
                ],
                [
                    'template_id'    => $template->id,
                    'evaluator_role' => null,
                    'assigned_by'    => null,
                    'assigned_at'    => now(),
                ]
            );
        }

        return $warnings;
    }

    /**
     * Resolution order:
     *  1. Template attached to this period via pivot, type=self, department matches employee's
     *  2. Template attached to this period via pivot, type=self, department null (period default)
     *  3. Any active template, type=self, department matches employee's (global department fallback)
     *  4. Any active template, type=self, department null (global default)
     */
    private function resolveSelfTemplate(EvaluationPeriod $period, Employee $employee): ?EvaluationTemplate
    {
        $deptId = $employee->department_id;

        // 1) Period-attached, department matches
        if ($deptId) {
            $template = $period->templates()
                ->wherePivot('evaluation_type', 'self')
                ->wherePivot('department_id', $deptId)
                ->first();
            if ($template) return $template;
        }

        // 2) Period-attached, department null (period default)
        $template = $period->templates()
            ->wherePivot('evaluation_type', 'self')
            ->wherePivotNull('department_id')
            ->first();
        if ($template) return $template;

        // 3) Global, department matches
        if ($deptId) {
            $template = EvaluationTemplate::query()
                ->where('status', 'active')
                ->where('evaluation_type', 'self')
                ->where('department_id', $deptId)
                ->first();
            if ($template) return $template;
        }

        // 4) Global default
        return EvaluationTemplate::query()
            ->where('status', 'active')
            ->where('evaluation_type', 'self')
            ->whereNull('department_id')
            ->first();
    }
}
