<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class SeanceResource extends JsonResource
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
            'dateSeance' => $this->dateSeance,
            'typeSeance' => $this->typeSeance,
            'depenseBoisson' => $this->depenseBoisson,
            'rapportReunion' => $this->rapportReunion,
            'lieu' =>$this->lieu
        ];
    }
}
