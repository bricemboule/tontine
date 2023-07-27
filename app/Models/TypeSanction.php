<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeSanction extends Model
{
    protected $fillable = ["intitule"];
    public function sanction(){

        return $this-hasMany(Sanction::class);
    }
}
