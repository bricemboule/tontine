<?php

namespace App\Http\Controllers\Api\President;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserPresidentController extends Controller
{
    public function valider($id){

        $membre = User::find($id);
        
        $membre->update(['valide'=> true]);

        return response()->json($membre);
        //return response()->json("Membre validé avec succès");
    }
}
