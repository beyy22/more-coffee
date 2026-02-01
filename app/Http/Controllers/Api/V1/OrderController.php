<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreOrderRequest;

class OrderController extends BaseController
{
    protected $paymentService;

    public function __construct(\App\Services\PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function index(Request $request)
    {
        // Must load 'items.product' so frontend can map through items!
        $query = Order::with(['user:id,name', 'items.product'])->withCount('items');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // KDS Mode: If asking for 'kds', return pending/processing/ready
        if ($request->has('kds')) {
            $query->whereIn('status', ['pending', 'processing', 'ready']);
        }

        $orders = $query->latest()->paginate($request->per_page ?? 10);
            
        return $this->successResponse($orders, 'Orders retrieved successfully');
    }

    public function show($uuid)
    {
        $order = Order::with(['items.product', 'user:id,name'])->where('uuid', $uuid)->firstOrFail();
        return $this->successResponse($order, 'Order details retrieved');
    }

    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();
        
        try {
            return DB::transaction(function () use ($validated, $request) {
                // Calculate Total & Validate Stock
                $totalAmount = 0;
                $orderItemsData = [];
                
                foreach ($validated['items'] as $item) {
                    $product = Product::where('uuid', $item['product_uuid'])->lockForUpdate()->firstOrFail();
                    
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Insufficient stock for product: {$product->name}");
                    }
                    
                    $price = $product->price;
                    $lineTotal = $price * $item['quantity'];
                    $totalAmount += $lineTotal;
                    
                    $orderItemsData[] = [
                        'product' => $product, // temporary holder
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $price,
                        'total' => $lineTotal
                    ];
                }

                // Determine initial status
                // Always start as 'pending' so it shows in KDS. Payment status handles the money side.
                $isManual = $validated['is_manual_payment'] ?? false;
                $status = 'pending';

                // Create Order
                $order = Order::create([
                    'user_id' => $request->user()?->id,
                    'customer_name' => $validated['customer_name'] ?? null,
                    'type' => $validated['type'] ?? 'dine_in',
                    'table_number' => $validated['table_number'] ?? null,
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'status' => $status,
                    'payment_status' => ($validated['payment_method'] === 'qris' && !$isManual) ? 'pending' : 'settlement'
                ]);

                // Create Order Items & Decrement Stock
                foreach ($orderItemsData as $data) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $data['product_id'],
                        'quantity' => $data['quantity'],
                        'price' => $data['price'],
                        'total' => $data['total']
                    ]);
                    
                    // Decrement Stock
                    $data['product']->decrement('stock', $data['quantity']);
                }
                
                // If QRIS and NOT Manual, generate Snap Token
                if ($validated['payment_method'] === 'qris' && !$isManual) {
                    $snapToken = $this->paymentService->getSnapToken($order);
                    $order->update(['snap_token' => $snapToken]);
                    // Reload order to include new field
                    $order->refresh();
                }

                return $this->successResponse($order->load('items'), 'Order created successfully', 201);
            });

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function updateStatus(Request $request, $uuid)
    {
        $order = Order::where('uuid', $uuid)->firstOrFail();
        
        $request->validate([
            'status' => 'required|in:pending,processing,ready,completed,cancelled'
        ]);

        $order->update(['status' => $request->status]);

        return $this->successResponse($order, 'Order status updated successfully');
    }
}
