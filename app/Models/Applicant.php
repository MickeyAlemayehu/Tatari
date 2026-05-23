<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'vacancy_id','first_name','last_name','email','phone',
        'resume_path','cover_letter','status','applied_at',
        'reviewed_by','reviewed_at','rejection_reason',
        'location','experience','rating','current_company',
        'education','notice_period','interview_at'
    ];

    protected $casts = [
        'applied_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'interview_at' => 'datetime',
        'rating' => 'decimal:1',
    ];

    public function vacancy() {
        return $this->belongsTo(JobVacancy::class, 'vacancy_id');
    }

    public function reviewer() {
        return $this->belongsTo(Employee::class, 'reviewed_by');
    }
}
