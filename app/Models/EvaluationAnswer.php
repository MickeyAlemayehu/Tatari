<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluation_id',
        'question_id',
        'rating',
        'text_answer',
        'selected_options',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'selected_options' => 'array',
    ];

    public function evaluation()
    {
        return $this->belongsTo(PerformanceEvaluation::class, 'evaluation_id');
    }

    public function question()
    {
        return $this->belongsTo(EvaluationQuestion::class, 'question_id');
    }
}
