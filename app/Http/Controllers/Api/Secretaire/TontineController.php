<?php

namespace App\Http\Controllers\Api\Secretaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\TontineRequest;
use App\Http\Resources\TontineResource;
use App\Models\Tontine;

class TontineController extends Controller
{
    public function index(){

        return TontineResource::collection(Tontine::all());

    }

    public function show(Tontine $tontine){

        return new TontineResource($tontine);

    }

    public function store(TontineRequest $request){
        $tontine = new Tontine();

        try {
            $tontine->nom = $request->nom;
            $tontine->nbDeParticipants = $request->nbDeParticipants;
            $tontine->dateDebut = $request->dateDebut;
            $tontine->dateFin = $request->dateFin;
            $tontine->observation = $request->observation;
            $tontine->save();

            return response()->json([

                'status' => '200',
                'message' => 'Tontine créee avec succès',
                'tontine' => $tontine
            ]);

        } catch (Exception $e) {
            return  response()->json($e);  
        }
    }

    public function update(TontineRequest $request, Tontine $tontine){
        return response()->json($tontine);
        $tontine->nom = $request->nom;
        $tontine->nbDeParticipants = $request->nbDeParticipants;
        $tontine->dateDebut = $request->dateDebut;
        $tontine->dateFin = $request->dateFin;
        $tontine->observation = $request->observation;
        $tontine->update();

        return response()->json("Tontine modifiée avec succès");
    }


    public function destroy(Tontine $tontine){
        $tontine->delete();
        return response()->json("Tontine supprimée avec succès");
    }
}
