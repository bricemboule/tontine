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
        return $this->belongsToMany(Seance::class, "membre_seance", "seance_id", "user_id")->withPivot("raisonAbsence", "commentaire", "present");
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

    public function retraits(){
        return $this->hasMany(Retrait::class);
    }

    public function suspensions(){

        return $this->hasMany(Suspension::class);
    }
}
