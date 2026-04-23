<?php

namespace App\Notifications;

use App\Models\Offer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOfferReceived extends Notification
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
        $klusser = $this->offer->klusser;

        return (new MailMessage)
            ->subject("Nieuwe aanmelding voor '{$klusje->title}'")
            ->greeting("Hoi {$notifiable->name},")
            ->line("{$klusser->name} heeft zich aangemeld voor je klus '{$klusje->title}'.")
            ->when((string) $this->offer->message !== '', fn ($m) => $m->line('Bericht: '.$this->offer->message))
            ->action('Bekijk aanmeldingen', url("/jobs/{$klusje->id}/offers"));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'offer.received',
            'offer_id' => $this->offer->id,
            'klusje_id' => $this->offer->klusje_id,
            'klusje_title' => $this->offer->klusje->title,
            'klusser_name' => $this->offer->klusser->name,
            'url' => "/jobs/{$this->offer->klusje_id}/offers",
        ];
    }
}
