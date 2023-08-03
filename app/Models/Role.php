<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;
    protected $filable =[
        'nom',
        'description'
    ];

    public function users(){

        return $this->belongsToMany(Role::class, "role_users", "role_id", "user_id")->withPivot("dateDebut", "dateFinPrevue", "dateFinEffective");
    }
}
