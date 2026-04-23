<?php

namespace App\Notifications;

use App\Models\Klusje;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class KlusjeCompleted extends Notification
{
    use Queueable;

    public function __construct(public Klusje $klusje) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("'{$this->klusje->title}' is voltooid")
            ->greeting("Hoi {$notifiable->name},")
            ->line("De klus '{$this->klusje->title}' is gemarkeerd als voltooid.")
            ->line('Laat een review achter om andere gebruikers te helpen.')
            ->action('Bekijk klus', url("/jobs/{$this->klusje->id}"));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'klusje.completed',
            'klusje_id' => $this->klusje->id,
            'klusje_title' => $this->klusje->title,
            'url' => "/jobs/{$this->klusje->id}",
        ];
    }
}
