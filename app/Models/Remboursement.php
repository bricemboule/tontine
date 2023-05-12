<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Remboursement extends Model
{
    use HasFactory;

    public function seance(){

        return $this->belongsTo(Seance::class);
    }

    public function pret(){

        return $this->belongsTo(Pret::class);
    }
}
