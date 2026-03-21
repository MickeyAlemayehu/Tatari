<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerformanceEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id','evaluator_id','employee_id',
        'evaluation_period_id','score','comments','submitted_at','status'
    ];

    public function assignment() {
        return $this->belongsTo(EvaluationAssignment::class);
    }
}
