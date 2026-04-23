<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'klusje_id' => ['required', 'integer', 'exists:klusjes,id'],
            'message' => ['nullable', 'string', 'max:2000'],
            'proposed_compensation' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
        ];
    }
}
