<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VersementCotis extends Model
{
    use HasFactory;

    public function membre(){

        return $this->belongsTo(User::class);
    }

    public function seance(){

        return $this->belongsTo(Seance::class);
    }

    public function tontine(){
        return $this->belongsTo(Tontine::class);
    }
}
