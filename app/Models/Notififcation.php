<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'title','message','notification_type',
        'reference_type','reference_id','is_read'
    ];

    public function recipient() {
        return $this->morphTo();
    }
}
