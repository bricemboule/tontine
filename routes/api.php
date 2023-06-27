<?php

use App\Http\Controllers\Api\Administrateur\PermissionController;
use App\Http\Controllers\Api\Administrateur\RoleController;
use App\Http\Controllers\Api\Administrateur\UserController;
use App\Http\Controllers\Api\Secretaire\MembreController;
use App\Models\Permisssion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [UserController::class, 'Register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout']);
Route::apiResource('roles', RoleController::class);
Route::apiResource('permissions', PermissionController::class);
Route::apiResource('membres', MembreController::class);
Route::apiResource('users', UserController::class);



Route::middleware('auth->sanctum')->group(function(){

    //Retourne l'utilisateur connecter
    Route::get('/user', function(Request $request){
        return $request->user();
    });

  
});





