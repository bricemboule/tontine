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
        Schema::create('versement_cotis', function (Blueprint $table) {
            $table->id();
            $table->decimal('montant', 15,2);
            $table->string('modeVersement');
            $table->string('couponVersement');
            $table->foreignId('user_id')
                  ->constrained()
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->foreignId('seance_id')
                  ->constrained()
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->foreignId('tontine_id')
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
        Schema::table('versement_cotis',function(Blueprint $table){

            $table->dropColumn(["user_id", "seance_id", "tontine_id"]);
        });
        Schema::dropIfExists('versement_cotis');
    }
};
