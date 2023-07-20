<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class NewSeanceRequest extends FormRequest
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
            'dateSeance' => 'required',
            'typeSeance' => 'required',
            'depenseBoisson' => 'required',
            'lieu' => 'required',
        ];
    }

    public function messages(){

        return [

            'dateSeance.required' => 'Vous devez renseigner la date de la séance',
            'typeSeance.required' => 'Vous devez entrer le type de la séance',
            'depenseBoisson.required' => 'Vous devez entrer la dépense en boisson',
            'lieu.required' => 'Vous devez entrer le lieu de la réunion'
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
