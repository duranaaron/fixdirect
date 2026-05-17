<?php

namespace App\Enums;

enum WithdrawalStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Paid = 'paid';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'In afwachting',
            self::Approved => 'Goedgekeurd',
            self::Paid => 'Uitbetaald',
            self::Rejected => 'Afgewezen',
        };
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::Paid, self::Rejected], true);
    }

    public function reservesBalance(): bool
    {
        return in_array($this, [self::Pending, self::Approved, self::Paid], true);
    }
}
