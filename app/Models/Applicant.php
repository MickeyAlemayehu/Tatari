<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'vacancy_id','first_name','last_name','email','phone',
        'resume_path','cover_letter','status','applied_at',
        'reviewed_by','reviewed_at','rejection_reason'
    ];

    public function vacancy() {
        return $this->belongsTo(JobVacancy::class, 'vacancy_id');
    }
}