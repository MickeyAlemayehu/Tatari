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
        'evaluation_type',
        'department_id',
        'weights',
    ];

    protected $casts = [
        'weights' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function questions()
    {
        return $this->hasMany(EvaluationQuestion::class, 'template_id')->orderBy('sort_order');
    }

    public function periods()
    {
        return $this->hasMany(EvaluationPeriod::class, 'template_id');
    }

    public function attachedPeriods()
    {
        return $this->belongsToMany(EvaluationPeriod::class, 'evaluation_period_templates', 'template_id', 'evaluation_period_id')
            ->withPivot('evaluation_type', 'department_id')
            ->withTimestamps();
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Returns the template's questions if (and only if) the template itself is of the
     * given evaluation type. Questions no longer carry an evaluation_type; their type
     * is inherited from the parent template.
     */
    public function questionsByType(string $evaluationType)
    {
        if ($this->evaluation_type !== $evaluationType) {
            return $this->questions()->whereRaw('1 = 0');
        }

        return $this->questions();
    }
}
