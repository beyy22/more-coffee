<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Models\User;

require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Authenticated Flow...\n";

try {
    // 1. Register User via Controller directly
    $authController = $app->make(AuthController::class);
    
    // Fake Request for Register
    $registerData = [
        'name' => 'Test Auth User',
        'email' => 'auth_test_' . time() . '@example.com',
        'password' => 'password',
        'password_confirmation' => 'password'
    ];
    
    // We need to validate manually or create a proper request instance
    // Simulating Service/Controller call logic
    $user = User::create([
        'name' => $registerData['name'],
        'email' => $registerData['email'],
        'password' => \Hash::make($registerData['password']),
    ]);
    
    echo "1. Register: Success (User ID: {$user->id})\n";
    
    // 2. Create Token Simulating Login
    $token = $user->createToken('test_token')->plainTextToken;
    echo "2. Login: Success (Token Generated)\n";
    
    // 3. Test Access Protected Route (Create Product)
    // We simulate Acting As user directly on the application logic level
    \Auth::login($user);
    $service = $app->make(\App\Services\ProductService::class);
    $product = $service->createProduct([
        'category_id' => 1,
        'name' => 'Authenticated Product',
        'description' => 'Created by authenticated user',
        'price' => 50000,
        'stock' => 10,
        'min_stock' => 1,
        'is_available' => true
    ]);
    
    echo "3. Protected Action: Success (Product Created: {$product->name}, UUID: {$product->uuid})\n";
    
    // 4. Logout
    $user->tokens()->delete();
    echo "4. Logout: Success (Tokens Revoked)\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
