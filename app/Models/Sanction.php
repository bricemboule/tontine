<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sanction extends Model
{
    public function typeSanction(){

        return $this->belongsTo(TypeSanction::class);
    }

    public function user(){

        return $this->belongsTo(User::class);
    }
}


