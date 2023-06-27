<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreerMembreRequest extends FormRequest
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
                'nom'=> 'required|string',
                'prenom' => 'required|string',
                'anneeNais' => 'required',
                'annééEntree' => 'required',
                'nbDeFemme' => 'required|intiger',
                'login' => 'required',
                'password' => 'required',
                'sexe' => 'required',
                'nomEpoux' => 'required|string',
                'telephone1' => 'required',
                'email' => 'required|unique:users,email',
                'photo' => 'required|mines:png,jpg,jpeg,gif'
        ];
    }

    public function messages(){

        return [
            'nom.required' => 'vous devez entrer un nom',
            'prenom.required' => 'vous devez entrer un prenom',
            'anneeNais.required' => 'veuillez entrer la date de naissance du membre',
            'anneeEntree.required' => 'veuillez entrer la date d\'entrée du membre',
            'nbDeFemme.required' => 'veuillez le nombre de femme du membre',
            'login.required' => 'veuillez entrer un login pour le membre',
            'password.required' => 'veuillez entrer un mot de passe du membre',
            'sexe.required' => 'veuillez entrer le sexe du membre',
            'nomEpoux.required' => 'veuillez entrer le nom de l\'époux ou de l\'épouse du membre',
            'telephone1.required' => 'veuillez entrer le téléphone du membre',
            'email.required' => 'veuillez entrer l\'adresse mail du mail',
            'email.unique' => 'cette adresse existe déjà',
            'photo.required' => 'veuillez entrer la photo du membre'
        ];
    }

    public function failedValidation(Validator $validator){

        throw HttpResponseException(response()->json([

            'succes' => false,
            'status' =>422,
            'error' => true,
            'message' => 'Erreure de validation',
            'errorList' => $validator->errors()
        ]));
    }
}
