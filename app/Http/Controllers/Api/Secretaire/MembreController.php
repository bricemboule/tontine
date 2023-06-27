<?php

namespace App\Http\Controllers\Api\Secretaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Requests\CreerMembreRequest;
use App\Models\User;
use App\Http\Resources\MembreResource;

class MembreController extends Controller
{
    public function index(){

        return MembreResource::collection(User::all());
    }

    public function store(CreerMembreRequest $request){

        $membreEdit = new User();

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
             $responsabilite = Role::Where('nom', 'membre')->first();
             $membre->roles()->attach($responsabilite->id, [
                    'dateDebut' => $request->dateDebut,
                    'dateFinPrevue' =>$request->dateFinPrevu,
                    'dateFinEffective' => $request->dateFinEffective
             ]);

            return response()->json([
                'status' => 200,
                'message' => 'Membre créé avec succes',
                'membre' => $membre,
                'role' => $membre->roles
                ]);
        
        } catch (Exception $e) {
            return  response()->json($e);  
        }
    }

    public function show(User $user){

        return new UserResource($user);
    }

    public function update(CreerMembreRequest $request, $id){

        $membreEdit = User::find($id);
        $membreEdit->nom = $request->nom;
        $membreEdit->prenom = $request->prenom;
        $membreEdit->anneeNais = $request->anneeNais;
        $membreEdit->anneeEntree = $request->anneeEntree;
        $membreEdit->nbDeFemme = $request->nbDeFemme;
        //$membreEdit->login = $request->login;
        //$membreEdit->password = Hash::make($request->password);
        $membreEdit->sexe = $request->sexe;
        $membreEdit->nomEpoux = $request->nomEpoux;
        $membreEdit->telephone1 = $request->telephone1;
        $membreEdit->telephone2 = $request->telephone2;
        $membreEdit->email = $request->email;
        $membreEdit->photo = $request->photo;

        $membreEdit->save();

        return response()->json("Informations du membre modifiées avec succès");
    }

    public function destroy(User $user){

        $use->delete();

        return response()->json("Membre supprimé avec succès");
    }
}
