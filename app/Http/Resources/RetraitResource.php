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
            'user_id' => $this->user_id,
            'seance_id' => $this->seance_id,
            'type_retrait_id' => $this->type_retrait_id
        ];
    }
}
