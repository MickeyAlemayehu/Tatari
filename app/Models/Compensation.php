<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compensation extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id','basic_salary','housing_allowance',
        'transport_allowance','other_allowances','currency',
        'effective_from','effective_to','status'
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }
}
