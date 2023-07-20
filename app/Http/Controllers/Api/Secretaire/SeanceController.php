<?php

namespace App\Http\Controllers\Api\Secretaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\SeanceResource;
use App\Http\Requests\NewSeanceRequest;
use App\Models\Seance;

class SeanceController extends Controller
{
    
    public function index(){

        return SeanceResource::collection(Seance::all());
    }

    public function show(Seance $seance){

        return new SeanceResource($seance);
    }

    public function store(NewSeanceRequest $request){
        $seance = new Seance();

        try {
            $seance->dateSeance = $request->date;
            $seance->typeSeance = $request->type;
            $seance->depenseBoisson = $request->depense;
            $seance->rapportReunion = $request->rapport;
            $seance->lieu = $request->lieu;

            $seance->save();

            return response()->json([

                'status' => '200',
                'message' => 'séance créee avec succès',
                'role' => $seance
            ]);

        } catch (Exception $e) {
            return  response()->json($e);  
        }
    }

    public function update(NewSeanceRequest $request, Seance $seance){
        
        $seance->dateSeance = $request->date;
        $seance->typeSeance = $request->type;
        $seance->depenseBoisson = $request->depense;
        $seance->rapportReunion = $request->rapport;
        $seance->lieu = $request->lieu;
        $seance->save();

        return response()->json("séance modifiée avec succès");
    }


    public function destroy(Seance $seance){
        $seance->delete();
        return response()->json("Séance supprimée avec succès");
    }

}
