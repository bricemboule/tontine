<?php

namespace App\Http\Controllers\Api\Administrateur;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\PermissionRequest;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Exception;

class PermissionController extends Controller
{
    public function index(){
        return PermissionResource::collection(Permission::all());
    }

    public function show(Permission $permission){

        return new PermissionResource($permission);
    }

    public function store(PermissionRequest $request){

        $permission = new Permission();

        try {
            $permission->libelle = $request->libelle;
            $permission->description = $request->description;
            $permission->save();

            return response()->json([
                'status' => '200',
                'message' => 'Permission créee avec succès',
                'permission' => $permission
            ]);

        } catch (Exception $e) {
            
            return response()->json($e);
        }

    }

    public function update(PermissionRequest $request, $id){
        $permissionEdit = Permission::find($id);
        $permissionEdit->libelle = $request->libelle;
        $permissionEdit->description = $request->description;
        $permissionEdit->save();


        return response()->json("Permission modifiée avec succès");
    }

    public function delete(Permission $permission){

        $permission->delete();

        return response()->json("Permission supprimée avec succès");
    }
}
