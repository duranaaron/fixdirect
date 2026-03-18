<?php

namespace Database\Factories;

use App\Models\Klusje;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Klusje>
 */
class KlusjeFactory extends Factory
{
    protected $model = Klusje::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'category' => fake()->randomElement([
                'Montage', 'Verhuizen', 'Schilderen', 'Tuinieren',
                'Schoonmaak', 'Reparatie', 'Overig',
            ]),
            'location' => fake()->city(),
            'date' => fake()->dateTimeBetween('now', '+30 days'),
            'compensation' => fake()->randomFloat(2, 10, 500),
            'description' => fake()->paragraph(),
            'status' => 'open',
        ];
    }
}
