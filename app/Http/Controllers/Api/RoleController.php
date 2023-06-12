<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Http\Requests\RoleRequest;
use App\Models\Role;
use Illuminate\Http\Request;
use Exception;

class RoleController extends Controller
{
    public function index(RoleRequest $request){

        return RoleResource::collection(Role::all());
       
    }


    public function show(Role $role){

        return new RoleResource($role);
    }


    public function store(RoleRequest $request){
        $role = new Role();

        try {
            $role->nom = $request->nom;
            $role->description = $request->description;

            $role->save();

            return response()->json([

                'status' => '200',
                'message' => 'role crée avec succès',
                'role' => $role
            ]);

        } catch (Exception $e) {
            return  response()->json($e);  
        }
    }


    public function update(RoleRequest $request, $id){
        $roleEdit = Role::find($id);
        $roleEdit->nom = $request->nom;
        $roleEdit->description = $request->description;
        $roleEdit->save();

        return response()->json("role modifié avec succès");
    }


    public function destroy(Role $role){
        $role->delete();
        return response()->json("Role supprimé avec succès");
    }

}
