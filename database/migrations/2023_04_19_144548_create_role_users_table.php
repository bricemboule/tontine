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
        Schema::create('role_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')
                  ->constrained()
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->foreignId('user_id')
                  ->constrained()
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->date('dateDebut');
            $table->date('dateFinPrevue');
            $table->date('dateFinEffective')->nullable();
            $table->text('observation')->nullable();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('role_users', function(Blueprint $table){

            $table->dropColumn(["role_id", "user_id"]);
        });
        Schema::dropIfExists('role_user');
    }
};
