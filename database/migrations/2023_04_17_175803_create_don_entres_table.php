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
        Schema::create('don_entres', function (Blueprint $table) {
            $table->id();
            $table->decimal('montant', 15,2);
            $table->date('dateDon');
            $table->text('observation');
            $table->string('donnateur');
            $table->string('telDonnateur');
            $table->string('typeDon');
            $table->foreignId('user_id')
                  ->constrained()
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('don_entres', function(Blueprint $table){
            Schema::dropColumn("user_id");
        });
        Schema::dropIfExists('don_entres');
    }
};
