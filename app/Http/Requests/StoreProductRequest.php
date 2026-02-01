<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'preparation_time' => 'integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'string|url', // Validasi setiap item di array images harus URL valid
        ];
    }
}
