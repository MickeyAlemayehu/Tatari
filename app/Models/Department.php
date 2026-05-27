<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = ['company_id','name','description','manager_id'];

    public function company() {
        return $this->belongsTo(Company::class);
    }

    public function employees() {
        return $this->hasMany(Employee::class);
    }

    public function manager() {
        return $this->belongsTo(Employee::class, 'manager_id');
    }
}
