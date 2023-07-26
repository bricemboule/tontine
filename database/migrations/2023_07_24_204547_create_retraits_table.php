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
        Schema::create('retraits', function (Blueprint $table) {
            $table->id();
            $table->decimal('montant');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('seance_id')->constrained();
            $table->foreignId('type_retrait_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retraits',function(Blueprint $table){

            $table->dropColumn(["user_id", "seance_id", "type_retrait_id"]);
        });
        Schema::dropIfExists('retraits');
    }
};
