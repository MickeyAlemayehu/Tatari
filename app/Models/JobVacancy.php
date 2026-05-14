<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobVacancy extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id','department_id','title','description',
        'requirements','employment_type','number_of_positions',
        'opening_date','closing_date','status','created_by',
        'location','salary_min','salary_max','salary_text',
        'responsibilities','benefits'
    ];

    protected $casts = [
        'opening_date' => 'date',
        'closing_date' => 'date',
    ];

    public function applicants() {
        return $this->hasMany(Applicant::class, 'vacancy_id');
    }

    public function department() {
        return $this->belongsTo(Department::class);
    }

    public function company() {
        return $this->belongsTo(Company::class);
    }

    public function creator() {
        return $this->belongsTo(Employee::class, 'created_by');
    }
}
