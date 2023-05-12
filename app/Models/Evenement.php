<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evenement extends Model
{
    use HasFactory;

    public function membres(){

        return $this->belongsToMany(User::class, "evenement_membre", "evenement_id", "user_id");
    }
}
