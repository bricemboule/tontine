<?php

namespace App\Http\Controllers\Api\President;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Suspension;

class UserPresidentController extends Controller
{
    public function valider($id){

        $membre = User::find($id);
        
        $membre->update(['valide'=> true]);

        return response()->json([
            'status' => 200,
            'message' => 'Membre validé avec succès',
            'membre' => $membre
        ]);
        //return response()->json("Membre validé avec succès");
    }

    public function suspendre($id){

        $suspension = Suspension::find($id);
        
        $suspension->update(['status'=> true]);

        return response()->json([
            'status' => 200,
            'message' => 'Suspension validée avec succès',
            'membre' => $suspension
        ]);
        //return response()->json("Membre validé avec succès");
    }

    public function retirerSuspendre($id){

        $suspension = Suspension::find($id);
        
        $suspension->update(['status'=> false]);

        return response()->json([
            'status' => 200,
            'message' => 'Suspension retirée avec succès',
            'membre' => $suspension
        ]);
        //return response()->json("Membre validé avec succès");
    }
}
