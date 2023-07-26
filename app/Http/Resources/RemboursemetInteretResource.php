<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RemboursemetInteretResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,
            'montant' => $this->montant,
            'modeVersement' =>$this->modeVersement,
            'couponVersement' => $this->couponVersement,
            'pret_id' => $this->pret_id,
            'seance_id' => $this->seance_id
        ];
    }
}
