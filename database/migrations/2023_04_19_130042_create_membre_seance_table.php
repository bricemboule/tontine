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
        Schema::create('membre_seance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('seance_id')->constrained();
            $table->string('raison_absence');
            $table->text('commentaires');
            $table->boolean('present')->default(1);
        });
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('membre_seance', function(Blueprint $table){

            $table->dropColumn(["user_id", "seance_id"]);
        });
        Schema::dropIfExists('membre_seance');
    }
};
