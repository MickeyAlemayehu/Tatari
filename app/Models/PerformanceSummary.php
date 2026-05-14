<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerformanceSummary extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'employee_id','evaluation_period_id',
        'self_score','peer_score','manager_score','final_score','calculated_at'
    ];

    protected $casts = [
        'self_score' => 'decimal:2',
        'peer_score' => 'decimal:2',
        'manager_score' => 'decimal:2',
        'final_score' => 'decimal:2',
        'calculated_at' => 'datetime',
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }

    public function period() {
        return $this->belongsTo(EvaluationPeriod::class, 'evaluation_period_id');
    }
}
