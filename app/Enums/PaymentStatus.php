<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Held = 'held';
    case Released = 'released';
    case Refunded = 'refunded';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'In afwachting',
            self::Held => 'In escrow',
            self::Released => 'Uitbetaald',
            self::Refunded => 'Terugbetaald',
            self::Failed => 'Mislukt',
        };
    }

    public function isFunded(): bool
    {
        return $this === self::Held;
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::Released, self::Refunded, self::Failed], true);
    }
}
