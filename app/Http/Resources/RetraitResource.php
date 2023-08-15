<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RetraitResource extends JsonResource
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
            'montant' =>$this->montant,
            'user' => $this->user,
            'seance' => $this->seance,
            'type_retrait' => $this->typeRetrait
        ];
    }
}
