<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Epargne extends Model
{
    use HasFactory;

    public function seance(){

        return $this->belongsTo(Seance::class);
    }
}
