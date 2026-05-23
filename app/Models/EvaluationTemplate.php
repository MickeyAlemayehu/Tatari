<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'title',
        'description',
        'status',
        'weights',
    ];

    protected $casts = [
        'weights' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function questions()
    {
        return $this->hasMany(EvaluationQuestion::class, 'template_id')->orderBy('sort_order');
    }

    public function periods()
    {
        return $this->hasMany(EvaluationPeriod::class, 'template_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function questionsByType(string $evaluationType)
    {
        return $this->questions()->where('evaluation_type', $evaluationType);
    }
}
