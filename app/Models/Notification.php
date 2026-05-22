<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'recipient_type','recipient_id',
        'title','message','notification_type',
        'reference_type','reference_id','is_read'
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function recipient() {
        return $this->morphTo();
    }
}
