<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tontine extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'nbDeParticipants',
        'dateDebut',
        'dateFin',
        'observation'
    ];

    public function membres(){

        return $this->hasMany(User::class);
    }

    public function versement_cotis(){

        return $this->hasMany(VersementCotis::class);
    }
    
}
