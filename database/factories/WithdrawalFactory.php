<?php

namespace Database\Factories;

use App\Enums\WithdrawalStatus;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Withdrawal>
 */
class WithdrawalFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 5, 500),
            'iban' => 'BE68539007547034',
            'account_holder' => $this->faker->name(),
            'status' => WithdrawalStatus::Pending,
            'admin_note' => null,
            'processed_by' => null,
            'processed_at' => null,
        ];
    }

    public function approved(): self
    {
        return $this->state(fn () => ['status' => WithdrawalStatus::Approved]);
    }

    public function paid(): self
    {
        return $this->state(fn () => [
            'status' => WithdrawalStatus::Paid,
            'processed_at' => now(),
        ]);
    }

    public function rejected(): self
    {
        return $this->state(fn () => [
            'status' => WithdrawalStatus::Rejected,
            'processed_at' => now(),
        ]);
    }
}
