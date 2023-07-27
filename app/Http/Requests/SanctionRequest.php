<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class SanctionRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
       
        return [
            'dateSanction' => 'required',
            'typeSanction' => 'required',
            'montant' => 'required',
            'membre' => 'required'
        ];
    }

    public function messages(){

        return [

            'dateSanction.required' => 'Vous devez renseigner la date de la sanction',
            'typeSanction.required' => 'Vous devez entrer la date de la sanction',
            'montant.required' => 'Vous devez entrer le  montant de la sanction',
            'membre.required' => 'Vous devez entrer le membre sanctionné'
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
