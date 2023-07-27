<?php

namespace App\Http\Controllers\Api\Secretaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\SuspensionResource;
use App\Http\Requests\SuspensionRequest;
use App\Models\User;
use App\Models\Suspension;

class SuspensionController extends Controller
{
    public function index(){
        return SuspensionResource::collection(Suspension::all());
    }

    public function show(Suspension $suspension){

        return new SuspensionResource($suspension);
    }

    public function store(SuspensionRequest $request){

        $suspension = new Suspension();

        $user = User::where('nom', $request->membre)->first();


        try {
            $suspension->motif = $request->motif;
            $suspension->periode = $request->periode;
            $suspension->user_id = $user->id;
            $suspension->save();

            return response()->json([
                'status' => '200',
                'message'=> 'Suspension enrégistrée avec succès',
                'suspension' => $suspension
            ]);

        } catch (Exception $e) {
            
            return respons()->json($e);
        }
    }

    public function update(SuspensionRequest $request, Suspension $suspension){

        $user = User::where('nom', $request->membre)->first();


        try {
            $suspension->motif = $request->motif;
            $suspension->periode = $request->periode;
            $suspension->user_id = $user->id;
            $suspension->update();

            return response()->json([
                'status' => '200',
                'message'=> 'Suspension modifiée avec succès',
                'suspension' => $suspension
            ]);

        } catch (Exception $e) {
            
            return respons()->json($e);
        }
    }

    public function destroy(Suspension $suspension){

        $suspension->delete();

        return response()->json("Suspension suppimée avec succès");
    }
}
