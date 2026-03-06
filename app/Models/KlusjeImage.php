<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KlusjeImage extends Model
{
    protected $fillable = ['klusje_id', 'image_path', 'is_primary'];

    // Een afbeelding hoort bij één specifiek klusje
    public function klusje()
    {
        return $this->belongsTo(Klusje::class);
    }
}