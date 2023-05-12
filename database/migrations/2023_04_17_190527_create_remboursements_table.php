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
        Schema::create('remboursements', function (Blueprint $table) {
            $table->id();
            $table->decimal('montant',15,2);
            $table->foreignId('seance_id')->constrained();
            $table->foreignId('pret_id')->constrained();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('remboursements', function(Blueprint $table){

            $table->dropColumn(["seance_id", "pret_id"]);
        });
        Schema::dropIfExists('remboursements');
    }
};
