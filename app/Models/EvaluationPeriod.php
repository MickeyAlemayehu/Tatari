<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluationPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id','name','start_date','end_date','status'
    ];

    public function company() {
        return $this->belongsTo(Company::class);
    }

    public function assignments() {
        return $this->hasMany(EvaluationAssignment::class);
    }
}
