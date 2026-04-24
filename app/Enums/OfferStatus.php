<?php

namespace App\Enums;

enum OfferStatus: string
{
    case Pending = 'pending';
    case CounterOffered = 'counter_offered';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Withdrawn = 'withdrawn';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'In behandeling',
            self::CounterOffered => 'Terugbod ontvangen',
            self::Accepted => 'Geaccepteerd',
            self::Rejected => 'Afgewezen',
            self::Withdrawn => 'Ingetrokken',
        };
    }
}
