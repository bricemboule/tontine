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
        Schema::create('solidarites', function (Blueprint $table) {
            $table->id();
            $table->decimal('reportAnneePrec', 15,2);
            $table->decimal('valeurAnnuelle', 15,2);
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
        Schema::table('solidarites', function(Blueprint $table){

            $table->dropColumn("user_id");
        });
        Schema::dropIfExists('solidarites');
    }
};
