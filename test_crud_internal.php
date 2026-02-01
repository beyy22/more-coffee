<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Requests\StoreProductRequest;
use Illuminate\Support\Facades\Validator;

require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Data input
$data = [
    'category_id' => 1,
    'name' => 'Kopi Tinker Test',
    'description' => 'Created via Tinker script',
    'price' => 35000,
    'stock' => 50,
    'min_stock' => 5,
    'is_available' => true
];

echo "Testing Store Product via Controller direct call...\n";

try {
    // Manually validating because FormRequest validation usually happens before controller
    // But we can simulate by calling service directly or constructing request
    // Let's call service directly first to ensure logic is sound
    $service = $app->make(\App\Services\ProductService::class);
    $product = $service->createProduct($data);
    
    echo "SUCCESS! Product Created:\n";
    echo "UUID: " . $product->uuid . "\n";
    echo "Name: " . $product->name . "\n";
    
    // Now let's try Update
    echo "\nTesting Update Product...\n";
    $updateData = ['name' => 'Kopi Tinker Updated', 'price' => 40000];
    $updatedProduct = $service->updateProduct($product->uuid, $updateData);
    echo "SUCCESS! Product Updated to: " . $updatedProduct->name . "\n";
    
    // Now Delete
    echo "\nTesting Delete Product...\n";
    $service->deleteProduct($product->uuid);
    echo "SUCCESS! Product Deleted.\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    if (method_exists($e, 'errors')) {
        print_r($e->errors());
    }
}
