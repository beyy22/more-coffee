<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use App\Models\Order;

class PaymentService
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function getSnapToken(Order $order)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $order->uuid,
                'gross_amount' => (int) $order->total_amount,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name ?? 'Guest',
                'email' => 'customer@example.com', // Optional
            ],
            'item_details' => $order->items->map(function ($item) {
                return [
                    'id' => $item->product->uuid,
                    'price' => (int) $item->price,
                    'quantity' => $item->quantity,
                    'name' => substr($item->product->name, 0, 50),
                ];
            })->toArray(),
        ];

        return Snap::getSnapToken($params);
    }
}
