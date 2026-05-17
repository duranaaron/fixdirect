<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreWithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && ! $this->user()->isSuspended();
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->iban)) {
            $this->merge([
                'iban' => strtoupper(preg_replace('/\s+/', '', $this->iban)),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:5', 'max:99999.99'],
            'iban' => ['required', 'string', 'regex:/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/'],
            'account_holder' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'iban.regex' => 'Geef een geldig IBAN op.',
            'amount.min' => 'Het minimum uitbetaalbedrag is €5.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $amount = (float) $this->input('amount');
            $available = $this->user()->availableBalance();

            if ($amount > $available) {
                $v->errors()->add(
                    'amount',
                    'Onvoldoende saldo. Beschikbaar: €'.number_format($available, 2, ',', '.'),
                );
            }
        });
    }
}
