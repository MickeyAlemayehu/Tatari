<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Compensation extends Model
{
    use HasFactory;

    protected $table = 'compensations';

    protected $fillable = [
        'employee_id', 'basic_salary', 'housing_allowance',
        'transport_allowance', 'other_allowances', 'currency',
        'effective_from', 'effective_to', 'status',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'housing_allowance' => 'decimal:2',
        'transport_allowance' => 'decimal:2',
        'other_allowances' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    public function employee() {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
