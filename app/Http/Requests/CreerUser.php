<?php

namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;


class CreerUser extends FormRequest
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
            'nom' => 'required',
            'prenom'=>'required',
            'anneeNais'=> 'required',
            'anneeEntree' =>'required',
            'nbDeFemme'=> 'required|integer',
            'login'=> 'required',
            'password' => 'required',
            'sexe'=> 'required',
            'nomEpoux' => 'required',
            'telephone1' => 'required',
            'email' => 'required|unique:users,email',
            //'photo' => 'required|mimes:png,jpg,jpeg,gif'
        ];
    }

    

    public function messages(){

        return[
            'nom.required' => 'Un nom doit être renseigné',
            'prenom.required' => 'Un prénom doit être renseigné',
            'anneeNais.required' =>'Une année de naissance doit être renseigné',
            'anneeEntree.required' => 'Une année d\'entrée doit être renseigné',
            'nbDeFemme.required' =>'Le nombre de femmes doit être renseigné',
            'login.required'=>'Vous devez entrer un login ou nom d\'utilisateur',
            'password.required' => 'Vous devez entrer un mot de passe',
            'sexe.required' => 'Vous devez entrer votre sexe',
            'nomEpoux.required' => 'Vous devez entrer le nom de votre époux',
            'telephone1.required' => 'Vous devez entrer votre numéro de téléphone',
            'email.required' => 'Vous devez entrer votre adresse email',
            'email.unique' => 'Cette adresse email existe déjà',
            //'photo.required'=> 'Vous devez entrer votre photo',
            //'photo.mimes' => 'L\'extension de la photo doit être : png,jpg,jpeg,gif '
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
