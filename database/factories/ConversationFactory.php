<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\Klusje;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'klusje_id' => Klusje::factory(),
            'starter_id' => User::factory(),
            'owner_id' => User::factory(),
        ];
    }
}
