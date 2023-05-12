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
        Schema::create('aide_maladies', function (Blueprint $table) {
            $table->id();
            $table->date('dateAide');
            $table->string('maladie');
            $table->string('hopital');
            $table->date('dateHospitalisation');
            $table->date('dateSortie');
            $table->foreignId('user_id')->constrained();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aide_maladies', function(Blueprint $table){

            $table->dropColumn("user_id");
        });
        Schema::dropIfExists('aide_maladies');
    }
};
