<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobVacancy extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id','department_id','title','description',
        'requirements','employment_type','number_of_positions',
        'opening_date','closing_date','status','created_by'
    ];

    public function applicants() {
        return $this->hasMany(Applicant::class, 'vacancy_id');
    }
}
