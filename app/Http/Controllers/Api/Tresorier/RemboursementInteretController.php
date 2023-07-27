<?php

namespace App\Http\Controllers\Api\Tresorier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\RemboursementInteretResource;
use App\Http\Requests\RemboursementInteretRequest;
use App\Models\User;
use App\Models\Pret;
use App\Models\Seance;
use App\Models\VersementInteret;

class RemboursementInteretController extends Controller
{
    public function index(){

        return RemboursementInteretResource::collection(VersementInteret::all());
    }

    public function show(VersementInteret $interet){

        return new RemboursementInteretResource($interet);
    }

    public function store(RemboursementInteretRequest $request){
        $remboursement = new VersementInteret();
        $pret = Pret::where('montant', $request->pret)->first();
        $user = User::where('nom', $request->membre)->first();
        $seance = Seance::where('dateSeance', $request->seance)->first();
            
        try {
            $remboursement->montant = $request->montant;
            $remboursement->modeVersement = $request->modeVersement;
            $remboursement->couponVersement = $request->couponVersement;
            $remboursement->pret_id = $pret->id;
            $remboursement->seance_id = $seance->id;
            $remboursement->user_id = $user->id;
            
            $remboursement->save();

            return response()->json([
                'status' => '200',
                'message' => 'Remboursement intérêt enregistré avec succès',
                'remboursement' => $remboursement
            ]);
        } catch (Exception $e) {
            return response()->json($e);

        }
    }

    public function update(RemboursementInteretRequest $request, VersementInteret $remboursement){

        $pret = Pret::where('montant', $request->pret)->first();
        $user = User::where('nom', $request->membre)->first();
        $seance = Seance::where('dateSeance', $request->seance)->first();

        try {
            $remboursement->montant = $request->montant;
            $remboursement->modeVersement = $request->modeVersement;
            $remboursement->couponVersemsent = $request->couponVersement;
            $remboursement->pret_id = $pret->id;
            $remboursement->seance_id = $seance->id;
            $remboursement->user_id = $user->id;
            
            $remboursement->update();

            return response()->json([
                'status' => '200',
                'message' => 'Remboursement intérêt modifé avec succès',
                'remboursement' => $remboursement
            ]);
        } catch (Exception $e) {
            return response()->json($e);

        }
    }

    public function destroy(VersementInteret $interet){

        $interet->delete();

        return response()->json("Remboursement intérêt supprimé avec succès");
    }
}
