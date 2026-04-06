<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerformanceReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'reviewer_id',
        'cycle',
        'status',
        'rating',
        'strengths',
        'areas_for_improvement',
        'goals_next_period',
        'due_date',
        'submitted_at',
        'completed_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(Employee::class, 'reviewer_id');
    }
}
