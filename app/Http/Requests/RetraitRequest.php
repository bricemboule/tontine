<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class RetraitRequest extends FormRequest
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
            'type_retrait' => 'required',
            'seance' => 'required',
            'membre' => 'required'
        ];
    }

    public function messages(){

        return [

            'montant.required' => 'Vous devez renseigner le montant du retrait',
            'type_retrait.required' => 'Vous devez entrer le type de retrait',
            'seance.required' => 'Vous devez entrer la séance du retrait',
            'membre.required' => 'Vous devez entrer le membre qui effectue le retrait'
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
