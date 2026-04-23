<?php

namespace App\Notifications;

use App\Models\Offer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OfferAccepted extends Notification
{
    use Queueable;

    public function __construct(public Offer $offer) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $klusje = $this->offer->klusje;

        return (new MailMessage)
            ->subject("Je bent geaccepteerd voor '{$klusje->title}'")
            ->greeting("Goed nieuws, {$notifiable->name}!")
            ->line("Je aanmelding voor '{$klusje->title}' is geaccepteerd.")
            ->action('Bekijk klus', url("/jobs/{$klusje->id}"));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'offer.accepted',
            'offer_id' => $this->offer->id,
            'klusje_id' => $this->offer->klusje_id,
            'klusje_title' => $this->offer->klusje->title,
            'url' => "/jobs/{$this->offer->klusje_id}",
        ];
    }
}
