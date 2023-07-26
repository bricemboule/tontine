<?php

namespace App\Http\Controllers\Api\Tresorier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\DepenseResource;
use App\Http\Requests\DepenseRequest;
use App\Http\Requests\EditDepenseRequest;
use App\Models\Depense;
use App\Models\Seance;
use Exception;

class DepenseController extends Controller
{
    public function index(){

        return DepenseResource::collection(Depense::all());
    }

    public function show(Depense $depense){

        return new DepenseResource($depense);
    }

    public function store(DepenseRequest $request){

        $depense = new Depense();
        $seance = Seance::where('dateSeance',$request->seance)->first();

        try {
            $depense->montant = $request->montant;
            $depense->raison = $request->raison;
            $depense->observation = $request->observation;
            $depense->seance_id = $seance->id;
            $depense->save();

            return response()->json([
                'status' => '200',
                'message' => 'Dépense enrégistrée avec succès',
                'depense' => $depense
            ]);

        } catch ( Exception $e) {
            return response()->json($e);
        }
    }

    public function update(EditDepenseRequest $request, Depense $depense){

        try {
            $depense->montant = $request->montant;
            $depense->raison = $request->raison;
            $depense->observation = $request->observation;
            $depense->update();
            
            return response()->json("Dépense modifiée avec succès");
        } catch (Exception $e) {
            return response()->json($e);
        }
    }

    public function destroy(Depense $depense){

        $depense->delete();

        return response()->json("Dépense supprumée avec succès");
    }
}
