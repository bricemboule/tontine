<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pret extends Model
{
    use HasFactory;

    public function versement_interets(){

        return $this->hasMany(VersementInteret::class);
    }

    public function user(){

        return $this->belongsTo(User::class);
    }

    public function remboursements(){

        return $this->hasMany(Remboursement::class);
    }

    public function seance(){
        return $this->belongsTo(Seance::class);
    }
}
