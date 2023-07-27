<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VersementCotisResource extends JsonResource
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
            'modeVersement' => $this->modeVersement,
            'couponVersement' => $this->couponVersement,
            'user_id' => $this->user_id,
            'seance_id' => $this->seance_id,
            'tontine_id' =>$this->tontine_id
        ];
    }
}
