<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreerUser;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;
use  Illuminate\Http\Request;

class UserController extends Controller
{

    public function index(){

            return UserResource::collection(User::all());
    }

    public function store(CreerUser $request){
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

            //dd($membre);

            //return response()->json($request->dateFinEffective);

             $membre->save();
             $responsabilite = Role::Where('nom', 'secretaire')->first();

             $membre->roles()->attach($responsabilite->id, [
                    'dateDebut' => $request->dateDebut,
                    'dateFinPrevue' =>$request->dateFinPrevue,
                    'dateFinEffective' => $request->dateFinEffective
             ]);

            return response()->json([
                'status' => 200,
                'message' => 'Membre créé avec succes',
                'membre' => $membre
                ]);
        
        } catch (Exception $e) {
            return  response()->json($e);  
        }

    }

    public function show(User $user){

        return new UserResource($user);
    }

    public function destroy(User $user){
        $user->delete();
        return response()->json("L\utilisateur a été supprimé avec succès");
    }



    public function Register(CreerUser $request){

        
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

                return response()->json([
                    'status' => 200,
                    'message' => 'Membre créé avec succes',
                    'membre' => $membre
                    ]);
            
            } catch (Exception $e) {
                return  response()->json($e);  
            }
    }

    public function logout(){

        
        
    }

    public function login(LoginRequest $request){

        if( auth()->attempt($request->only(['login', 'password']))){

                $user = auth()->user();
                $token = $user->createToken('von_visible')->plainTextToken;

                return response()->json([
                        'status' => 200,
                        'message' => 'Utilisateur connecté',
                        'user' => $user,
                        'role' => $user->roles,
                        'token' => $token
                ]);
        }else{
                return response()->json([
                    'status' => 403,
                    'message' => 'Informations non valides',
                ]);
        }
    }
}
