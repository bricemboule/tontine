<?php

namespace App\Http\Controllers\Api\Tresorier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\RetraitRequest;
use App\Http\Resources\RetraitResource;
use App\Models\TypeRetrait;
use App\Models\Retrait;
use App\Models\User;
use App\Models\Seance;


class RetraitController extends Controller
{
    public function index(){

        return RetraitResource::collection(TypeRetrait::all());
    }

    public function show(Retrait $etrait){

        return new RetraitResource($retrait);
    }

    public function store(RetraitRequest $request){
        $retrait = new Retrait();

        $type = TypeRetrait::where('intitule', $request->type_retrait)->first();
        
        $user = User::where('nom', $request->membre)->first();
       
        $seance = Seance::where('dateSeance', $request->seance)->first();
        

        try {
            $retrait->montant = $request->montant;
            $retrait->type_retrait_id = $type->id;
            $retrait->seance_id = $seance->id;
            $retrait->user_id = $user->id;
            $retrait->save();

            return response()->json([
                'status' => '200',
                'message' => 'Retrait enregistré avec succès',
                'retrait' => $retrait
            ]);
        } catch (Exception $e) {
            return response()->json($e);

        }
    }

    public function update(RetraitRequest $request, Retrait $retrait){

        $type = TypeRetrait::where('intitule', $request->type)->first();
        $user = User::where('nom', $request->membre)->first();
        $seance = Seance::where('dateSeance', $request->seance)->first();
        try {
            $retrait->montant = $request->montant;
            $retrait->type_retrait_id = $type->id;
            $retrait->seance_id = $seance->id;
            $retrait->user_id = $user->id;
            $type->update();
            
            return response()->json("Retrait modifié avec succès");
        } catch (Exception $e) {
            return response()->json($e);
        }
    }

    public function destroy(Retrait $retrait){

        $retrait->delete();

        return response()->json("Retrait supprimé avec succès");
    }
}
