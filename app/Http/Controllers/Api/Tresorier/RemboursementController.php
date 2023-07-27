<?php

namespace App\Http\Controllers\Api\Tresorier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\RemboursementResource;
use App\Http\Requests\RemboursementRequest;
use App\Models\User;
use App\Models\Pret;
use App\Models\Seance;
use App\Models\Remboursement;

class RemboursementController extends Controller
{
    public function index(){

        return RemboursementResource::collection(Remboursement::all());
    }

    public function show(Remboursement $remboursement){

        return new RemboursementResource($remboursement);
    }

    public function store(RemboursementRequest $request){
        $remboursement = new Remboursement();
        $pret = Pret::where('montant', $request->pret)->first();
        $user = User::where('nom', $request->membre)->first();
        $seance = Seance::where('dateSeance', $request->seance)->first();

        try {
            $remboursement->montant = $request->montant;
            $remboursement->pret_id = $pret->id;
            $remboursement->seance_id = $seance->id;
            
            $remboursement->save();

            return response()->json([
                'status' => '200',
                'message' => 'Remboursement enregistré avec succès',
                'remboursement' => $remboursement
            ]);
        } catch (Exception $e) {
            return response()->json($e);

        }
    }

    public function update(RemboursementRequest $request, Remboursement $remboursement){

        $pret = Pret::where('montant', $request->pret)->first();
        $user = User::where('nom', $request->membre)->first();
        $seance = Seance::where('dateSeance', $request->seance)->first();

        try {
            $remboursement->montant = $request->montant;
            $remboursement->pret_id = $pret->id;
            $remboursement->seance_id = $seance->id;
            
            $remboursement->update();

            return response()->json([
                'status' => '200',
                'message' => 'Remboursement modifié avec succès',
                'remboursement' => $remboursement
            ]);
        } catch (Exception $e) {
            return response()->json($e);

        }
    }

    public function destroy(Remboursement $remboursement){

        $remboursement->delete();

        return response()->json("Remboursement supprimé avec succès");
    }
}
