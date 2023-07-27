<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SanctionResource extends JsonResource
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
            'dateSanction' => $this->dateSanction,
            'montant' => $this->montant,
            'user_id' => $this->user_id,
            'type_sanction_id' => $this->type_sanction_id     
        ];
    }
}