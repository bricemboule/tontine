<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Retrait extends Model
{

    protected $fillable = [
        'montant',
        'intitule',
        'user_id',
        'seance_id',
        'type_seance_id'
    ];
    use HasFactory;

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function seance(){
        return $this->belongsTo(Seance::class);
    }

    public function typeRetrait(){

        return $this->belongsTo(typeRetrait::class);
    }
}
