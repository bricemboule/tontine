<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreerUser;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use  Illuminate\Http\Request;

class UserController extends Controller
{
    
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
            $membre->valide = 1;
            $membre->sexe = $request->sexe;
            $membre->nomEpoux = $request->nomEpoux;
            $membre->telephone1 = $request->telephone1;
            $membre->telephone2 = $request->telephone2;
            $membre->email = $request->email;
            $membre->actif = 1;
            $membre->photo = $request->photo;

            $membre->save();
            
            } catch (\Throwable $th) {
                
            }
    }

    public function logout(){

        
    }

    public function login(LoginRequest $request){

        if( auth()->attempt($request->only(['login', 'password']))){

                $user = auth()->user();
                $token = $user->createToken('von_visible')->plainTextToken;

                return response()->json([
                        'status_code' => 200,
                        'status_message' => 'Utilisateur connecté',
                        'user' => $user,
                        'token' => $token
                ]);


        }else{

            return response()->json([
                'status_code' => 403,
                'status_message' => 'Information non valide',
            ]);
        }
    }
}
