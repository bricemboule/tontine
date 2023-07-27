<?php

namespace App\Http\Controllers\Api\Tresorier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\VersementCotisResource;
use App\Http\Requests\VersementCotisRequest;
use App\Models\Tontine;
use App\Models\User;
use App\Models\Seance;
use App\Models\VersementCotis;
use Exception;

class VersementCotisController extends Controller
{
    public function index(){

        return VersementCotisResource::collection(VersementCotis::all());
    }

    public function show(VersementCotis $cotisation){

        return new VersementCotisResource($cotisation);
    }

    public function store(VersementCotisRequest $request){
        $cotisation = new VersementCotis();
       
        $user = User::where('nom', $request->membre)->first();
        $tontine = Tontine::where('nom', $request->tontine)->first();
        $seance = Seance::where('dateSeance', $request->seance)->first();

        try {
            $cotisation->montant = $request->montant;
            $cotisation->modeVersement = $request->modeVersement;
            $cotisation->couponVersement = $request->couponVersement;
            $cotisation->user_id = $user->id;
            $cotisation->tontine_id = $tontine->id;
            $cotisation->seance_id = $seance->id;

            
            $cotisation->save();

            return response()->json([
                'status' => '200',
                'message' => 'Cotisation enregistrée avec succès',
                'cotisation' => $cotisation
            ]);
        } catch (Exception $e) {
            return response()->json($e);

        }
    }

    public function update(VersementCotisRequest $request, VersementCotis $cotisation){

        $user = User::where('nom', $request->membre)->first();
        $tontine = Tontine::where('nom', $request->tontine)->first();
        $seance = Seance::where('dateSeance', $request->seance)->first();

        try {
            $cotisation->montant = $request->montant;
            $cotisation->modeVersement = $request->modeVersement;
            $cotisation->couponVersement = $request->couponVersement;
            $cotisation->user_id = $user->id;
            $cotisation->tontine_id = $tontine->id;
            $cotisation->seance_id = $seance->id;
            
            $cotisation->update();

            return response()->json([
                'status' => '200',
                'message' => 'Cotisation modifiée avec succès',
                'cotisation' => $cotisation
            ]);
        } catch (Exception $e) {
            return response()->json($e);

        }
    }

    public function destroy(VersementCotis $cotisation){

        $cotisation->delete();

        return response()->json("Cotisation supprimée avec succès");
    }
}
