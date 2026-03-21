<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerformanceSummary extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'employee_id','evaluation_period_id',
        'self_score','peer_score','manager_score','final_score','calculated_at'
    ];
}
