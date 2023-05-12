<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seance extends Model
{
    use HasFactory;

    public function versement_cotis(){

        return $this->hasMany(VersementCotis::class);
    }

    public function achat_cotis(){

        return $this->hasMany(AchatCotis::class);
    }

    public function depenses(){

        return $this->hasMany(Depense::class);
    }

    public function membre(){
        return $this->belongsTo(User::class);
    }

    public function epargnes(){

        return $this->hasMany(Epargne::class);
    }

    public function versement_interets(){
        return $this->hasMany(VersementInteret::class);
    }

    public function remboursements(){

        return $this->hasMany(Remboursement::class);
    }
}
