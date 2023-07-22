<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'anneeNais' => $this->anneeNais,
            'anneeEntree' => $this->anneeEntree,
            'nbDeFemme' => $this->nbDeFemme,
            'valide' => $this->valide,
            'login' => $this->login,
            'password' => $this->password,
            'sex' => $this->sexe,
            'nomEpoux' => $this->nomEpoux,
            'telephone1' => $this->telephone1,
            'telephone2' =>$this->telephone2,
            'email' => $this->email,
            'photo'=> $this->photo

        ];
    }
}
