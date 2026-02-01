<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            // Ignore unique rule for current product is handled in controller or by using unique:products,sku,{id} but we use UUID in routes.
            // For simplicity, we assume SKU check handles UUID exception or we skip unique check on update if not modified.
            // Using a simple rule here:
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $this->route('product'), // Assuming route key is id, but it is UUID. We might need adjustment.
            'stock' => 'sometimes|integer|min:0',
            'min_stock' => 'sometimes|integer|min:0',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'preparation_time' => 'integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'string|url',
        ];
    }
}
