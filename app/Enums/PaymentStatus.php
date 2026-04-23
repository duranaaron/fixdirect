<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Succeeded = 'succeeded';
    case Failed = 'failed';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'In afwachting',
            self::Processing => 'Wordt verwerkt',
            self::Succeeded => 'Voltooid',
            self::Failed => 'Mislukt',
            self::Refunded => 'Terugbetaald',
        };
    }
}
