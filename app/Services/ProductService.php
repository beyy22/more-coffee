<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductService
{
    public function getAllProducts(array $filters = [])
    {
        $query = Product::with('category')
            ->when(isset($filters['category']), function ($q) use ($filters) {
                $q->whereHas('category', function ($q) use ($filters) {
                    $q->where('slug', $filters['category']);
                });
            })
            ->when(isset($filters['available']), function ($q) use ($filters) {
                $q->where('is_available', filter_var($filters['available'], FILTER_VALIDATE_BOOLEAN));
            })
            ->when(isset($filters['featured']), function ($q) use ($filters) {
                $q->where('is_featured', filter_var($filters['featured'], FILTER_VALIDATE_BOOLEAN));
            })
            ->when(isset($filters['search']), function ($q) use ($filters) {
                $q->where(function ($q) use ($filters) {
                    $q->where('name', 'like', "%{$filters['search']}%")
                      ->orWhere('description', 'like', "%{$filters['search']}%");
                });
            });

        if (isset($filters['sort']) && $filters['sort'] === 'best_seller') {
            $query->withSum('orderItems as total_sold', 'quantity')
                  ->orderByDesc('total_sold')
                  ->orderBy('name');
        } else {
            $query->orderBy('sort_order')
                  ->orderBy('name');
        }

        return isset($filters['paginate']) && !filter_var($filters['paginate'], FILTER_VALIDATE_BOOLEAN)
            ? $query->get()
            : $query->paginate($filters['per_page'] ?? 15);
    }

    public function getProductByUuid(string $uuid)
    {
        return Product::with('category')->where('uuid', $uuid)->firstOrFail();
    }

    public function createProduct(array $data): Product
    {
        DB::beginTransaction();
        try {
            if (!isset($data['slug'])) {
                $data['slug'] = Str::slug($data['name']) . '-' . Str::random(6);
            }

            $product = Product::create($data);

            // Generate SKU if not provided
            if (empty($data['sku'])) {
                $category = Category::find($data['category_id']);
                $prefix = $category ? strtoupper(substr($category->slug, 0, 3)) : 'PRO';
                $product->sku = $prefix . '-' . str_pad($product->id, 6, '0', STR_PAD_LEFT);
                $product->save();
            }

            DB::commit();
            return $product->load('category');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateProduct(string $uuid, array $data): Product
    {
        $product = Product::where('uuid', $uuid)->firstOrFail();
        $product->update($data);
        return $product->load('category');
    }

    public function deleteProduct(string $uuid): void
    {
        $product = Product::where('uuid', $uuid)->firstOrFail();
        $product->delete();
    }

    public function getAllCategories()
    {
        return Category::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }
}