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
        Schema::create('epargnes', function (Blueprint $table) {
            $table->id();
            $table->decimal('montant');
            $table->string('modeVersement');
            $table->string('couponVersement');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('seance_id')->constrained();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('epargnes', function(Blueprint $table){

            $table->dropColumn(["user_id", "seance_id"]);
        });
        Schema::dropIfExists('epargnes');
    }
};
