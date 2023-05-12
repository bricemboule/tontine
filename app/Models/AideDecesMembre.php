<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AideDecesMembre extends Model
{
    use HasFactory;

    public function membres(){

        return $this->belongsToMany(User::class, "designe_pour_voyage", "aide_deces_membre_id");
    }
}
