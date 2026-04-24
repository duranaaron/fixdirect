<?php

namespace App\Notifications;

use App\Models\Offer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CounterOfferReceived extends Notification
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
        $poster = $klusje->user;

        return (new MailMessage)
            ->subject("Terugbod ontvangen voor '{$klusje->title}'")
            ->greeting("Hoi {$notifiable->name},")
            ->line("{$poster->name} heeft een terugbod gedaan op je aanmelding voor '{$klusje->title}'.")
            ->line('Terugbod: €'.number_format((float) $this->offer->counter_offer_compensation, 2, ',', '.'))
            ->when((string) $this->offer->counter_offer_message !== '', fn ($m) => $m->line('Bericht: '.$this->offer->counter_offer_message))
            ->action('Bekijk terugbod', url('/my/offers'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'offer.counter',
            'offer_id' => $this->offer->id,
            'klusje_id' => $this->offer->klusje_id,
            'klusje_title' => $this->offer->klusje->title,
            'counter_offer_compensation' => $this->offer->counter_offer_compensation,
            'url' => '/my/offers',
        ];
    }
}
