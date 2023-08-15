<?php

namespace App\Http\Controllers\Api\Tresorier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\NewTypeRetraitRequest;
use App\Http\Resources\TypeRetraitResource;
use App\Models\TypeRetrait;
use Exception;

class TypeRetraitController extends Controller
{
    public function index(){

        return TypeRetraitResource::collection(TypeRetrait::all());
    }

    public function show(TypeRetrait $type_retrait){

        return new TypeRetraitResource($type_retrait);
    }

    public function store(NewTypeRetraitRequest $request){
        $type = new TypeRetrait();

        try {
            $type->intitule = $request->intitule;
            $type->description = $request->description;
            $type->save();

            return response()->json([
                'status' => '200',
                'message' => 'Type de retrait enregistré avec succès',
                'type_retrait' => $type
            ]);
        } catch (Exception $e) {
            return response()->json($e);

        }
    }

    public function update(NewTypeRetraitRequest $request, TypeRetrait $type_retrait){

    
        try {
            $type_retrait->intitule = $request->intitule;
            $type_retrait->description = $request->description;
            $type_retrait->update();
            
            return response()->json("Type retrait modifié avec succès");
        } catch (Exception $e) {
            return response()->json($e);
        }
    }

    public function destroy(TypeRetrait $type_retrait){

        $type_retrait->delete();

        return response()->json("Type de retrait supprimé avec succès");
    }
}
