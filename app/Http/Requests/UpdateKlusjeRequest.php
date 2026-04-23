<?php

namespace App\Http\Requests;

use App\Models\Klusje;
use Illuminate\Foundation\Http\FormRequest;

class UpdateKlusjeRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Klusje $klusje */
        $klusje = $this->route('klusje');

        return $this->user()?->can('update', $klusje) ?? false;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'location' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'compensation' => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'description' => ['required', 'string', 'min:10'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg', 'max:5120'],
            'removed_image_ids' => ['nullable', 'array'],
            'removed_image_ids.*' => ['integer', 'exists:klusje_images,id'],
        ];
    }
}
