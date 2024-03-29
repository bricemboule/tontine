<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SuspensionResource extends JsonResource
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
            'motif' =>$this->motif,
            'periode' =>$this->periode,
            'membre' => $this->user,
            'seance' => $this->seance,
            'status' => $this->status
        ];
    }
}
