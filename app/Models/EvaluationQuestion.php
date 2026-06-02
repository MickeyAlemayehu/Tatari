<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'text',
        'type',
        'category',
        'required',
        'sort_order',
        'weight',
    ];

    protected $casts = [
        'required' => 'boolean',
        'weight' => 'decimal:2',
    ];

    public function template()
    {
        return $this->belongsTo(EvaluationTemplate::class, 'template_id');
    }

    public function options()
    {
        return $this->hasMany(EvaluationQuestionOption::class, 'question_id')->orderBy('sort_order');
    }

    public function answers()
    {
        return $this->hasMany(EvaluationAnswer::class, 'question_id');
    }
}
