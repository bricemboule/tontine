<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;


class VersementCotisRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
       
        return [
            'montant' => 'required',
            'modeVersement' => 'required',
            'couponVersement' => 'required',
            'tontine' => 'required',
            'seance' => 'required',
            'membre' => 'required'
        ];
    }

    public function messages(){

        return [

            'montant.required' => 'Vous devez renseigner le montant de la cotisation',
            'modeVersement.required' => 'Vous devez entrer le mode de versement',
            'couponVersement.required' => 'Vous devez entrer le coupon de versement',
            'tontine.required' => 'Vous devez entrer la tontine de la cotisation',
            'seance.required' => 'Vous devez entrer la séance de la cotisation',
            'membre.required' => 'Vous devez entrer le membre qui cotise'
        ];
    }

    public function failedValidation(Validator $validator){

        throw new HttpResponseException(response()->json([
            'success' => false,
            'status'=> 422,
            'error' =>true,
            'message' => 'Erreur de validation',
            'errorsList' => $validator->errors()
        ]));
    }
}
