<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Get the UUID from the route parameter
        // The parameter name depends on route definition. Since we used apiResource, it is usually 'category' (singular of resource name)
        // Check `routes/api.php` -> apiResource('categories', ...). Parameter likely 'category'.
        // Route model binding might not be active if we use string uuid in controller.
        // Controller update($request, $uuid).
        // Validation unique ignore needs ID. We have UUID.
        // We need to find the ID from UUID to ignore it, OR use ignore with column.
        
        $uuid = $this->route('category'); // This returns string UUID if no binding, or Model if binding.
        
        // Assuming string UUID as per standard resource if model binding not implicit or configured.
        // Let's assume we need to find the ID for unique check.
        
        // Actually unique rule with 'id' is standard. 'uuid' column ignore?
        // unique:table,column,except,idColumn
        
        return [
            'name' => [
                'sometimes', 
                'required', 
                'string', 
                'max:255', 
                Rule::unique('categories', 'name')->ignore($uuid, 'uuid')
            ],
            'slug' => [
                'nullable', 
                'string', 
                'max:255', 
                 Rule::unique('categories', 'slug')->ignore($uuid, 'uuid')
            ],
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ];
    }
}
