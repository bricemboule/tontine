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
        Schema::create('achat_cotis', function (Blueprint $table) {
            $table->id();
            $table->decimal('montantAchete');
            $table->integer('numLot');
            $table->decimal('prixAchat',15,2);
            $table->foreignId('user_id')
                  ->constrained()
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->foreignId('tontine_id')
                  ->constrained()
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->foreignId('seance_id')
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
        Schema::table('achat_cotis', function(Blueprint $table){

            $table->dropColumn(["user_id", "tontine_id", "seance_id"]);
        });
        Schema::dropIfExists('achat_cotis');
    }
};
