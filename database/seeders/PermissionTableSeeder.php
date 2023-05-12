<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        DB::table('permissions')->insert([

            ["libelle" => "Ajouter un membre"],
            ["libelle" => "Valider un membre"],
            ["libelle" => "Consulter un membre"],

            ["libelle" => "Ajouter un pret"],
            ["libelle" => "Consulter les prets"],
            ["libelle" => "Editer un pret"]

        ]);
    }
}
