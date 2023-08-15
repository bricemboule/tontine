<?php

namespace App\Http\Controllers\Api\Censeur;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\SanctionRequest;
use App\Http\Resources\SanctionResource;
use App\Models\TypeSanction;
use App\Models\Sanction;
use App\Models\User;
use Exception;

class SanctionController extends Controller
{
    public function index(){
        return SanctionResource::collection(Sanction::all());
    }

    public function show(Sanction $sanction){

        return new SanctionResource($sanction);
    }

    public function store(SanctionRequest $request){

        $sanction = new Sanction();

        $type = TypeSanction::where('intitule', $request->typeSanction)->first();
        $user = User::where('nom', $request->membre)->first();


        try {
            $sanction->dateSanction = $request->dateSanction;
            $sanction->montant = $request->montant;
            $sanction->type_sanction_id = $type->id;
            $sanction->user_id = $user->id;
            $sanction->save();

            return response()->json([
                'status' => '200',
                'message'=> 'Sanction enrégistrée avec succès',
                'sanction' => $sanction
            ]);

        } catch (Exception $e) {
            
            return response()->json($e);
        }
    }

    public function update(SanctionRequest $request, Sanction $sanction){

        $type = TypeSanction::where('intitule', $request->typeSanction)->first();
        $user = User::where('nom', $request->membre)->first();


        try {
            $sanction->dateSanction = $request->dateSanction;
            $sanction->montant = $request->montant;
            $sanction->type_sanction_id = $type->id;
            $sanction->user_id = $user->id;
            $sanction->update();

            return response()->json([
                'status' => '200',
                'message'=> 'Sanction modifiée avec succès',
                'sanction' => $sanction
            ]);

        } catch (Exception $e) {
            
            return response()->json($e);
        }
    }

    public function destroy(Sanction $sanction){

        $sanction->delete();

        return response()->json("Sanction suppimée avec succès");
    }
}
