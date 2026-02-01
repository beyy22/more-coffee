<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => 'nullable|string|max:255',
            'type' => 'nullable|in:dine_in,take_away',
            'table_number' => 'nullable|required_if:type,dine_in|string|max:10',
            'payment_method' => 'required|in:cash,qris',
            'is_manual_payment' => 'nullable|boolean',
            'items' => 'required|array|min:1',
            'items.*.product_uuid' => 'required|exists:products,uuid',
            'items.*.quantity' => 'required|integer|min:1',
        ];
    }
}
