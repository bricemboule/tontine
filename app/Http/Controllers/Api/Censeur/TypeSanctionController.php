<?php

namespace App\Http\Controllers\Api\Censeur;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\TypeSanctionRequest;
use App\Http\Resources\TypeSanctionResource;
use App\Models\TypeSanction;

class TypeSanctionController extends Controller
{
    public function index(){

        return TypeSanctionResource::collection(TypeSanction::all());
    }

    public function show(TypeSanction $type_sanction){

        return new TypeSanctionResource($type_sanction);
    }

    public function store(TypeSanctionRequest $request){

        $sanction = new TypeSanction();

        try {
            $sanction->intitule = $request->intitule;
            $sanction->save();

            return response()->json([
                'status' => '200',
                'message' => 'Sanction créée avec succès',
                'type_sanction' => $sanction
            ]);
        } catch (Exception $e) {
            return response()->json($e);
        }
    }

    public function update(TypeSanctionRequest $request, TypeSanction $type){
        
        try {
            $type->intitule = $request->intitule;
            $type->update();
            return response()->json([
                'status' => '200',
                'message' => 'Sanction modifiée avec succès avec succès',
                'type_sanction' => $type
            ]);
        } catch (Exception $e) {
            return response()->json($e);
        }

    }

    public function destroy(TypeSanction $type){

        $type->delete();

        return response()->json("Sanction supprimée avec succès");
    }
}
