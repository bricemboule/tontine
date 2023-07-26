<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeRetrait extends Model
{
    use HasFactory;

    protected $fillable =['intitule'];

    public function retraits(){

        return $this->hasMany(TypeRetrait::class);
    }
}
