<?php

namespace App\Http\Controllers\Api\Tresorier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\PretResource;
use App\Http\Requests\PretRequest;
use App\Models\User;
use App\Models\Pret;
use App\Models\Seance;

class PretController extends Controller
{
    public function index(){

        return PretResource::collection(Pret::all());
    }

    public function show(Pret $pret){

        return new PretResource($pret);
    }

    public function store(PretRequest $request){

        //return response()->json($request);
        $pret = new Pret();
        $membre = User::where('nom', $request->membre)->first();
        $seance = Seance::where('dateSeance',$request->seance)->first();

        try {
            $pret->montant = $request->montant;
            $pret->observation = $request->observations;
            $pret->pourcentage = $request->pourcentage;
            $pret->user_id = $membre->id;
            $pret->seance_id = $seance->id;
            $pret->save();

            return response()->json([
                'status' => '200',
                'message' => 'Prêt enrégistré avec succès',
                'prêt' => $pret
            ]);

        } catch ( Exception $e) {
            return response()->json($e);
        }
    }

    public function update(PretRequest $request, Pret $pret){

        $membre = User::where('nom', $request->membre)->first();
        $seance = Seance::where('dateSeance',$request->seance)->first();

        try {
            $pret->montant = $request->montant;
            $pret->observation = $request->observations;
            $pret->pourcentage = $request->pourcentage;
            $pret->user_id = $membre->id;
            $pret->seance_id = $seance->id;
            $pret->update();

            return response()->json([
                'status' => '200',
                'message' => 'Prêt modifié avec succès',
                'prêt' => $pret
            ]);

        } catch ( Exception $e) {
            return response()->json($e);
        }
    }

    public function destroy(Pret $pret){

        $pret->delete();

        return response()->json("Prêt supprumé avec succès");
    }
}
