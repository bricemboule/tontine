<?php

namespace App\Http\Controllers\Secretaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resquests\TontineResquest;
use App\Http\Resources\TontineResource;
use App\Models\Tontine;

class Tontinecontroller extends Controller
{
    public function index(){

        return TontineResource::collection(Tontine::all());

    }

    public function show(Tontine $tontine){

        return new TontineResource($tontine);

    }

    public function update(TontineRequest $resquest, $id){

        $tontineEdit = Tontine::find($id);
        

    }

    public function destroy(Tontine $tontine){

        $tontine->delete();
        return response()->json("Tontine supprimée avec succès");
    }
}
