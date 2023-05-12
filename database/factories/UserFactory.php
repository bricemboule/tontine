<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use app\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $user = User::class;
    public function definition(): array
    {
        return [
            'nom' => $this->faker->lastName,
            'prenom' => $this->faker->firstName,
            'anneeNais' =>$this->faker->year,
            'anneeEntree' => $this->faker->year,
            'nbDeFemme' => array_rand([1,2,3,4,5],1),
            'login'=>$this->faker->lastName,
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'valide' => array_rand([0,1],1),
            'sexe'=> array_rand(["F", "H"], 1),
            'nomEpoux' =>$this->faker->lastName,
            'telephone1' => $this->faker->phoneNumber,
            'telephone2'=>$this->faker->phoneNumber,
            'email' => fake()->unique()->safeEmail(),
            'actif' =>array_rand([0,1],1),
            'photo' =>$this->faker->imageUrl,
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
