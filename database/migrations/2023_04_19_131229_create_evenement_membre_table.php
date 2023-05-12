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
        Schema::create('evenement_membre', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evenement_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->boolean('a_effectue')->default(0);
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evenement_membre', function(Blueprint $table){
            $table->dropColumn(["evenement_id", "user_id"]);
        });
        Schema::dropIfExists('evenement_membre');
    }
};
