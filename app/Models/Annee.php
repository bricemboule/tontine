<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Annee extends Model
{
    use HasFactory;

    public function membres(){

        return $this->belongsToMany(User::class, 'annee_membre', 'annee_id', 'user_id');
    }
}
