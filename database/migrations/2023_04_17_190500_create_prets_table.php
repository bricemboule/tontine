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
        Schema::create('prets', function (Blueprint $table) {
            $table->id();
            $table->decimal('montant',15,2);
            $table->text('observation');
            $table->decimal('pourcentage');
            $table->foreignId('user_id')
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
        Schema::table('prets', function(Blueprint $table){

            $table->dropColumn(["user_id", "seance_id"]);
        });
        Schema::dropIfExists('prets');
    }
};
