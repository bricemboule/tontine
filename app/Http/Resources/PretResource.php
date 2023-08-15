<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PretResource extends JsonResource
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
                'observation' =>$this->observation,
                'pourcentage' => $this->pourcentage,
                'user' => $this->user,
                'seance' => $this->seance
        ];
    }
}
