<?php

namespace Database\Factories;

use App\Models\Klusje;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Offer>
 */
class OfferFactory extends Factory
{
    protected $model = Offer::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'klusje_id' => Klusje::factory(),
            'klusser_id' => User::factory(),
            'message' => fake()->sentence(),
            'proposed_compensation' => fake()->randomFloat(2, 10, 500),
            'status' => 'pending',
        ];
    }
}
