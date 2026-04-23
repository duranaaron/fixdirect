<?php

namespace App\Notifications;

use App\Models\Review;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewReceived extends Notification
{
    use Queueable;

    public function __construct(public Review $review) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $klusje = $this->review->klusje;

        return (new MailMessage)
            ->subject('Je hebt een nieuwe review ontvangen')
            ->greeting("Hoi {$notifiable->name},")
            ->line("Je hebt een {$this->review->rating}/5 sterren review ontvangen voor '{$klusje->title}'.")
            ->action('Bekijk je profiel', url("/users/{$notifiable->id}"));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'review.received',
            'review_id' => $this->review->id,
            'klusje_id' => $this->review->klusje_id,
            'klusje_title' => $this->review->klusje->title,
            'rating' => $this->review->rating,
            'url' => "/users/{$notifiable->id}",
        ];
    }
}
