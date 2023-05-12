<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class RoleUserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            
            "role_id" =>array_rand([1,7],1),
            "user_id" =>array_rand([1,10],1),
            "dateDebut" => $this->faker->date,
            "dateFinPrevue" =>$this->faker->date,
            "dateFinEffective"=>$this->faker->date,
            "observation" =>$this->faker->text,
        ];
    }
}
