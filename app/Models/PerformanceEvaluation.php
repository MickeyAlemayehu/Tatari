<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerformanceEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id','evaluator_id','employee_id',
        'evaluation_period_id','score','comments','submitted_at','status'
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'submitted_at' => 'datetime',
    ];

    public function assignment() {
        return $this->belongsTo(EvaluationAssignment::class);
    }

    public function evaluator() {
        return $this->belongsTo(Employee::class, 'evaluator_id');
    }

    public function employee() {
        return $this->belongsTo(Employee::class);
    }

    public function period() {
        return $this->belongsTo(EvaluationPeriod::class, 'evaluation_period_id');
    }
}
