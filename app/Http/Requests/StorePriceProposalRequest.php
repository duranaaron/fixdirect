<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePriceProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        $conversation = $this->route('conversation');

        return $this->user()->id === $conversation->starter_id
            || $this->user()->id === $conversation->owner_id;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1'],
            'scheduled_at' => ['required', 'date', 'after_or_equal:today'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Een bedrag is verplicht.',
            'amount.numeric' => 'Het bedrag moet een geldig getal zijn.',
            'amount.min' => 'Het bedrag moet minstens €1 zijn.',
            'scheduled_at.required' => 'Een datum is verplicht.',
            'scheduled_at.date' => 'De datum moet een geldige datum zijn.',
            'scheduled_at.after_or_equal' => 'De datum moet vandaag of later zijn.',
        ];
    }
}
