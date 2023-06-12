<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->date('anneeNais');
            $table->date('anneeEntree');
            $table->integer('nbDeFemme');
            $table->string('login');
            $table->string('password');
            $table->boolean('valide')->default(False);
            $table->char('sexe');
            $table->string('nomEpoux');
            $table->string('telephone1');
            $table->string('telephone2')->nullable();
            $table->string('email')->unique();
            $table->string('photo')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
