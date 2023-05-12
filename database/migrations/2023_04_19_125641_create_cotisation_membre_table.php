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
        Schema::create('cotisation_membre', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cotisation_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cotisation_membre', function(Blueprint $table){

            $table->dropColumn(["cotisation_id", "user_id"]);
        });
        Schema::dropIfExists('cotisation_membre');
    }
};
