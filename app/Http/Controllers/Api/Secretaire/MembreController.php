<?php

namespace App\Http\Controllers\Api\Secretaire;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreerMembreRequest;
use App\Http\Requests\EditMembreRequest;
use App\Models\User;
use App\Http\Resources\MembreResource;
use Illuminate\Support\Facades\Hash;

class MembreController extends Controller
{
    public function index(){

        return MembreResource::collection(User::all());
    }

    public function store(CreerMembreRequest $request){

        $membre = new User();

        try {
            
            $membre->nom = $request->nom;
            $membre->prenom = $request->prenom;
            $membre->anneeNais = $request->anneeNais;
            $membre->anneeEntree = $request->anneeEntree;
            $membre->nbDeFemme = $request->nbDeFemme;
            $membre->login = $request->login;
            $membre->password = Hash::make($request->password);
            $membre->sexe = $request->sexe;
            $membre->nomEpoux = $request->nomEpoux;
            $membre->telephone1 = $request->telephone1;
            $membre->telephone2 = $request->telephone2;
            $membre->email = $request->email;
            $membre->photo = $request->photo;

             $membre->save();
             $token = $membre->createToken('registerToken')->plainTextToken;
            

            return response()->json([
                'status' => 200,
                'message' => 'Membre créé avec succes',
                'membre' => $membre
                ]);
        
        } catch (Exception $e) {
            return  response()->json($e);  
        }
    }

    public function show(User $membre){

        return new MembreResource($membre);
    }

    public function update(EditMembreRequest $request, $id){
        
        $membreEdit = User::find($id);
       
        $membreEdit->nom = $request->nom;
        $membreEdit->prenom = $request->prenom;
        
        $membreEdit->anneeNais = $request->anneeNais;
        $membreEdit->anneeEntree = $request->anneeEntree;
        $membreEdit->nbDeFemme = $request->nbDeFemme;
        $membreEdit->sexe = $request->sexe;
        $membreEdit->nomEpoux = $request->nomEpoux;
        $membreEdit->telephone1 = $request->telephone1;
        $membreEdit->telephone2 = $request->telephone2;
        $membreEdit->email = $request->email;
        $membreEdit->photo = $request->photo;
        $membreEdit->login = $request->login;
        $membreEdit->password = Hash::make($request->password);
        

        $membreEdit->update();

        return response()->json("Informations du membre modifiées avec succès");
    }

    public function destroy(User $user){

        $use->delete();

        return response()->json("Membre supprimé avec succès");
    }
}
