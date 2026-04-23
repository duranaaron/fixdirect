<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(
            $this->profileRules($this->user()->id),
            [
                'bio' => ['nullable', 'string', 'max:1000'],
                'location' => ['nullable', 'string', 'max:255'],
                'phone' => ['nullable', 'string', 'max:32'],
                'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            ],
        );
    }
}
