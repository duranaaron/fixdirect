<?php

namespace App\Enums;

enum OfferStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Withdrawn = 'withdrawn';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'In behandeling',
            self::Accepted => 'Geaccepteerd',
            self::Rejected => 'Afgewezen',
            self::Withdrawn => 'Ingetrokken',
        };
    }
}
