<?php

use App\Http\Controllers\Api\Administrateur\PermissionController;
use App\Http\Controllers\Api\Administrateur\RoleController;
use App\Http\Controllers\Api\Administrateur\UserController;
use App\Http\Controllers\Api\President\UserPresidentController;
use App\Http\Controllers\Api\Secretaire\MembreController;
use App\Http\Controllers\Api\Secretaire\SeanceController;
use App\Http\Controllers\Api\Secretaire\TontineController;
use App\Http\Controllers\Api\Secretaire\SuspensionController;
use App\Http\Controllers\Api\Tresorier\DepenseController;
use App\Http\Controllers\Api\Tresorier\TypeRetraitController;
use App\Http\Controllers\Api\Tresorier\RetraitController;
use App\Http\Controllers\Api\Tresorier\PretController;
use App\Http\Controllers\Api\Tresorier\RemboursementController;
use App\Http\Controllers\Api\Tresorier\RemboursementInteretController;
use App\Http\Controllers\Api\Tresorier\VersementCotisController;
use App\Http\Controllers\Api\Censeur\TypeSanctionController;
use App\Http\Controllers\Api\Censeur\SanctionController;

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
Route::apiResource('membres', MembreController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('seances', SeanceController::class);
Route::put('valider/{id}', [UserPresidentController::class, 'valider']);
Route::apiResource('tontines', TontineController::class);
Route::apiResource('depenses', DepenseController::class);
Route::apiResource('type_retraits', TypeRetraitController::class);
Route::apiResource('retraits', RetraitController::class);
Route::apiResource('prets', PretController::class);
Route::apiResource('remboursements', RemboursementController::class);
Route::apiResource('interets', RemboursementInteretController::class);
Route::apiResource('cotisations', VersementCotisController::class);
Route::apiResource('suspensions', SuspensionController::class);
Route::apiResource('sanctions', SanctionController::class);
Route::apiResource('type_sanctions', TypeSanctionController::class);



Route::middleware('auth->sanctum')->group(function(){

    //Retourne l'utilisateur connecter
    Route::get('/user', function(Request $request){
        return $request->user();
    });

  
});





