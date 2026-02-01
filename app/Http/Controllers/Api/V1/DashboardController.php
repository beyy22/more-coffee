<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class DashboardController extends BaseController
{
    public function stats()
    {
        $totalProducts = Product::count();
        $lowStockProducts = Product::where('stock', '<=', 5)->count();
        $totalCategories = Category::count();
        
        // Order Stats
        $totalOrders = \App\Models\Order::count();
        $totalRevenue = \App\Models\Order::where('status', 'completed')->sum('total_amount');
        
        // Recent 5 Orders
        $recentOrders = \App\Models\Order::with(['user:id,name'])->latest()->take(5)->get();

        return $this->successResponse([
            'total_products' => $totalProducts,
            'low_stock_count' => $lowStockProducts,
            'total_categories' => $totalCategories,
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'recent_orders' => $recentOrders
        ], 'Dashboard stats retrieved successfully');
    }
}
