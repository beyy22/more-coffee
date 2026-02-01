<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends BaseController
{
    public function __construct(ProductService $productService)
    {
        parent::__construct($productService);
    }

    public function index(Request $request)
    {
        $products = $this->service->getAllProducts($request->all());
        return $this->successResponse($products, 'Products retrieved successfully');
    }

    public function show($uuid)
    {
        $product = $this->service->getProductByUuid($uuid);
        return $this->successResponse($product, 'Product retrieved successfully');
    }

    public function store(\App\Http\Requests\StoreProductRequest $request)
    {
        $product = $this->service->createProduct($request->validated());
        return $this->successResponse($product, 'Product created successfully', 201);
    }

    public function update(\App\Http\Requests\UpdateProductRequest $request, $uuid)
    {
        $product = $this->service->updateProduct($uuid, $request->validated());
        return $this->successResponse($product, 'Product updated successfully');
    }

    public function destroy($uuid)
    {
        $this->service->deleteProduct($uuid);
        return $this->successResponse(null, 'Product deleted successfully', 204);
    }

    public function categories()
    {
        $categories = $this->service->getAllCategories();
        return $this->successResponse($categories, 'Categories retrieved successfully');
    }
}