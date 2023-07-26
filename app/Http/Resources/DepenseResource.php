<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepenseResource extends JsonResource
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
                'raison' => $this->raison,
                'observation' => $this->observation,
                'seance_id'=>$this->seance_id

                ];
    }
}
