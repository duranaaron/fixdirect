<?php

namespace App\Enums;

enum KlusjeStatus: string
{
    case Open = 'open';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Wacht op doener',
            self::Assigned => 'Toegewezen',
            self::InProgress => 'Bezig',
            self::Completed => 'Voltooid',
            self::Cancelled => 'Geannuleerd',
        };
    }

    public function isEditable(): bool
    {
        return in_array($this, [self::Open], true);
    }

    public function isOpenForOffers(): bool
    {
        return $this === self::Open;
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Open, self::Assigned, self::InProgress], true);
    }
}
