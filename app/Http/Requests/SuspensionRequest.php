<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class SuspensionRequest extends FormRequest
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
            'motif' => 'required',
            'periode' => 'required',
            'membre' => 'required'
        ];
    }

    public function messages(){

        return [

            'motif.required' => 'Vous devez entrer le motif de la suspension',
            'periode.required' => 'Vous devez entrer la période de suspension',
            'membre.required' => 'Vous devez entrer le membre à suspendre'
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
