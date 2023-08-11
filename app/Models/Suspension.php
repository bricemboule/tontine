<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suspension extends Model
{
    public function user(){

        return $this->belongsTo(User::class);
    }

    public function seance(){

        return $this->belongsTo(Seance::class);
    }
}
