<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\AuthController;

Route::prefix('v1')->group(function () {
    // Auth Routes (Public)
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Webhooks (Public)
    Route::post('/webhooks/midtrans', [\App\Http\Controllers\Api\V1\PaymentController::class, 'webhook']);
    
    // Fallback jika user akses login via browser (GET)
    Route::get('/auth/login', function () {
        return response()->json([
            'success' => false,
            'message' => 'Method GET not allowed. Please use POST with email and password to login via API Client.'
        ], 405);
    })->name('login');

    // Fallback jika user akses register via browser (GET)
    Route::get('/auth/register', function () {
        return response()->json([
            'success' => false,
            'message' => 'Method GET not allowed. Please use POST with name, email, password to register via API Client.'
        ], 405);
    });

    // Public Product Routes (Read-only)
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{uuid}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductController::class, 'categories']);

    // Protected Routes (Butuh Token)
    Route::middleware('auth:sanctum')->group(function () {
        // Auth Actions
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'updatePassword']);

        // Upload Image
        Route::post('/upload', [\App\Http\Controllers\Api\V1\ImageUploadController::class, 'upload']);

        // Category Management
        // Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('categories', CategoryController::class);
        
        // Product Management (Create, Update, Delete)
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{uuid}', [ProductController::class, 'update']);
        Route::delete('/products/{uuid}', [ProductController::class, 'destroy']);

        // POS / Orders
        Route::get('/orders', [\App\Http\Controllers\Api\V1\OrderController::class, 'index']);
        Route::put('/orders/{uuid}/status', [\App\Http\Controllers\Api\V1\OrderController::class, 'updateStatus']);

        // Reports
        Route::get('/reports/sales', [\App\Http\Controllers\Api\V1\ReportController::class, 'sales']);
        Route::get('/reports/top-products', [\App\Http\Controllers\Api\V1\ReportController::class, 'topProducts']);
        Route::get('/reports/export', [\App\Http\Controllers\Api\V1\ReportController::class, 'export']);

        // Inventory
        Route::get('/inventory/logs', [\App\Http\Controllers\Api\V1\InventoryController::class, 'index']);
        Route::post('/inventory/add', [\App\Http\Controllers\Api\V1\InventoryController::class, 'store']);
    });

    // Public Order Creation (Guest/Self Order)
    Route::post('/orders', [\App\Http\Controllers\Api\V1\OrderController::class, 'store']);
    Route::get('/orders/{uuid}', [\App\Http\Controllers\Api\V1\OrderController::class, 'show']);

    // Test route
    Route::get('/test', function () {
        return response()->json([
            'success' => true,
            'message' => 'MORE Coffee & Space API is running!',
            'version' => '1.0.0',
            'timestamp' => now()->toISOString()
        ]);
    });
});