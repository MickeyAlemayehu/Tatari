<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationAssignment extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'evaluation_period_id','employee_id','evaluator_id',
        'evaluator_type','assigned_by','assigned_at'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function period() {
        return $this->belongsTo(EvaluationPeriod::class, 'evaluation_period_id');
    }

    public function employee() {
        return $this->belongsTo(Employee::class);
    }

    public function evaluator() {
        return $this->belongsTo(Employee::class, 'evaluator_id');
    }

    public function evaluation() {
        return $this->hasOne(PerformanceEvaluation::class, 'assignment_id');
    }

    public function assignedBy() {
        return $this->belongsTo(Employee::class, 'assigned_by');
    }
}
