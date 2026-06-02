<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantRecommendation extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_MANUAL_REVIEW = 'manual_review';

    public const VERDICT_RECOMMENDED = 'recommended';
    public const VERDICT_CONSIDER = 'consider';
    public const VERDICT_NOT_RECOMMENDED = 'not_recommended';

    protected $fillable = [
        'applicant_id',
        'vacancy_id',
        'status',
        'score',
        'verdict',
        'summary',
        'strengths',
        'gaps',
        'cv_text_excerpt',
        'cv_text_length',
        'model_version',
        'input_hash',
        'error_message',
        'processed_at',
        'notified_at',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'strengths' => 'array',
        'gaps' => 'array',
        'cv_text_length' => 'integer',
        'processed_at' => 'datetime',
        'notified_at' => 'datetime',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(JobVacancy::class, 'vacancy_id');
    }
}
