<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\PriceProposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PriceProposal>
 */
class PriceProposalFactory extends Factory
{
    protected $model = PriceProposal::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'user_id' => User::factory(),
            'amount' => fake()->randomFloat(2, 10, 500),
            'scheduled_at' => fake()->dateTimeBetween('now', '+30 days'),
            'status' => 'pending',
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'accepted',
            'responded_at' => now(),
        ]);
    }

    public function declined(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'declined',
            'responded_at' => now(),
        ]);
    }
}
