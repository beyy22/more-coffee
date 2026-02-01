<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends BaseController
{
    public function sales(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->query('end_date', Carbon::now()->format('Y-m-d'));

        // Group by Date
        $sales = Order::where('status', 'completed')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as total_orders')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return $this->successResponse($sales, 'Sales report retrieved');
    }

    public function topProducts(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->query('end_date', Carbon::now()->format('Y-m-d'));

        $topProducts = OrderItem::select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total) as total_revenue')
            )
            ->whereHas('order', function($q) use ($startDate, $endDate) {
                $q->where('status', 'completed')
                  ->whereDate('created_at', '>=', $startDate)
                  ->whereDate('created_at', '<=', $endDate);
            })
            ->with('product:id,name,price')
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->product ? $item->product->name : 'Unknown Product',
                    'quantity' => $item->total_quantity,
                    'revenue' => $item->total_revenue
                ];
            });

        return $this->successResponse($topProducts, 'Top products retrieved');
    }

    public function export(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->query('end_date', Carbon::now()->format('Y-m-d'));

        $orders = Order::with(['items.product', 'user'])
            ->where('status', 'completed')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->latest()
            ->get();

        $filename = "sales_report_{$startDate}_{$endDate}.csv";
        $handle = fopen('php://memory', 'w+');

        // Header
        fputcsv($handle, ['Order UUID', 'Date', 'Customer', 'Table', 'Items', 'Total Amount', 'Payment Method']);

        foreach ($orders as $order) {
            $items = $order->items->map(fn($i) => "{$i->quantity}x {$i->product->name}")->join(', ');
            
            fputcsv($handle, [
                $order->uuid,
                $order->created_at->format('Y-m-d H:i:s'),
                $order->customer_name ?? $order->user?->name ?? 'Guest',
                $order->table_number ?? '-',
                $items,
                $order->total_amount,
                $order->payment_method
            ]);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"");
    }
}
