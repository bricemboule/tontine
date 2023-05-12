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
        Schema::create('sanctions', function (Blueprint $table) {
            $table->id();
            $table->date('dateSanction');
            $table->string('typeSanction');
            $table->decimal('montant',15,2);
            $table->text('raison');
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
        Schema::table('sanctions', function(Blueprint $table){

            $table->dropColumn("user_id");
        });
        Schema::dropIfExists('sanctions');
    }
};
