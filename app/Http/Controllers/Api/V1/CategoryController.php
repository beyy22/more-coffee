<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Support\Str;

class CategoryController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::withCount('products');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Return all if 'all' param exists, otherwise paginate
        if ($request->has('all')) {
             $categories = $query->orderBy('sort_order')->orderBy('name')->get();
        } else {
             $categories = $query->orderBy('sort_order')->orderBy('name')->paginate(10);
        }

        return $this->successResponse($categories, 'Categories retrieved successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();
        
        // Auto generate slug if not provided? Or request handles it.
        // Usually slug is generated from name.
        if (!isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        
        // Handle logic if slug exists? Validation handles unique.

        $category = Category::create($data);

        return $this->successResponse($category, 'Category created successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($uuid)
    {
        $category = Category::where('uuid', $uuid)->firstOrFail();
        return $this->successResponse($category, 'Category details retrieved');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, $uuid)
    {
        $category = Category::where('uuid', $uuid)->firstOrFail();
        $data = $request->validated();

        if (isset($data['name']) && !isset($data['slug'])) {
             // Optional: Update slug when name changes? 
             // Usually better to keep slug stable unless explicitly changed or creating new.
             // But for CMS often we want slug to match name.
             $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return $this->successResponse($category, 'Category updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($uuid)
    {
        $category = Category::where('uuid', $uuid)->firstOrFail();
        
        // Check if products exist?
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category because it has products.'
            ], 422);
        }

        $category->delete();

        return $this->successResponse(null, 'Category deleted successfully');
    }
}
