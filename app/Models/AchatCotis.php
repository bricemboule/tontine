<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AchatCotis extends Model
{
    use HasFactory;

    public function avaliste(){

        return $this->belongsTo(User::class);
    }

    public function cotisation(){

        return $this->belongsTo(Cotisation::class);
    }

    public function seance(){

        return $this->belongsTo(Seance::class);
    }
}
