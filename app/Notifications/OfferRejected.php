<?php

namespace App\Notifications;

use App\Models\Offer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OfferRejected extends Notification
{
    use Queueable;

    public function __construct(public Offer $offer) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $klusje = $this->offer->klusje;

        return (new MailMessage)
            ->subject('Je aanmelding is afgewezen')
            ->line("Helaas is je aanmelding voor '{$klusje->title}' niet geaccepteerd.")
            ->action('Vind andere klusjes', url('/find'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'offer.rejected',
            'offer_id' => $this->offer->id,
            'klusje_id' => $this->offer->klusje_id,
            'klusje_title' => $this->offer->klusje->title,
            'url' => '/my/offers',
        ];
    }
}
