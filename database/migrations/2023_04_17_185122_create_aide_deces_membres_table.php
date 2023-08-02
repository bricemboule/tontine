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
        Schema::create('aide_deces_membres', function (Blueprint $table) {
            $table->id();
            $table->date('dateDeces');
            $table->string('causeDeces');
            $table->decimal('montantAide', 15,2);
            $table->string('nomBeneficiaire');
            $table->string('lienBeneficiaireAvecMembre');
            $table->date('dateAide');
            $table->string('lieuEnterrement');
            $table->date('dateVoyage');
            $table->foreignId('user_id')
                  ->constrained()
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aide_deces_membres', function(Blueprint $table){

            $table->dropColumn('user_id');
        });
        Schema::dropIfExists('aide_deces_membres');
    }
};
