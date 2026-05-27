<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id','template_id','name','start_date','end_date','status'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function company() {
        return $this->belongsTo(Company::class);
    }

    public function template() {
        return $this->belongsTo(EvaluationTemplate::class, 'template_id');
    }

    public function templates() {
        return $this->belongsToMany(EvaluationTemplate::class, 'evaluation_period_templates', 'evaluation_period_id', 'template_id')
            ->withPivot('evaluation_type', 'department_id')
            ->withTimestamps();
    }

    public function assignments() {
        return $this->hasMany(EvaluationAssignment::class);
    }

    public function evaluations() {
        return $this->hasMany(PerformanceEvaluation::class);
    }

    public function summaries() {
        return $this->hasMany(PerformanceSummary::class);
    }
}
