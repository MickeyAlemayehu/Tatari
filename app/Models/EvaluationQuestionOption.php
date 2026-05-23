<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluationQuestionOption extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'question_id',
        'label',
        'value',
        'sort_order',
    ];

    public function question()
    {
        return $this->belongsTo(EvaluationQuestion::class, 'question_id');
    }
}
