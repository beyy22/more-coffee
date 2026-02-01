<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Midtrans\Config;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function webhook(Request $request)
    {
        try {
            $notification = new Notification();
            
            $status = $notification->transaction_status;
            $type = $notification->payment_type;
            $orderId = $notification->order_id;
            $fraud = $notification->fraud_status;

            $order = Order::where('uuid', $orderId)->firstOrFail();

            if ($status == 'capture') {
                if ($type == 'credit_card') {
                    if ($fraud == 'challenge') {
                        $order->update(['payment_status' => 'challenge']);
                    } else {
                        $order->update(['payment_status' => 'settlement', 'status' => 'completed']);
                    }
                }
            } else if ($status == 'settlement') {
                $order->update(['payment_status' => 'settlement', 'status' => 'completed']);
            } else if ($status == 'pending') {
                $order->update(['payment_status' => 'pending']);
            } else if ($status == 'deny') {
                $order->update(['payment_status' => 'deny', 'status' => 'cancelled']);
            } else if ($status == 'expire') {
                $order->update(['payment_status' => 'expire', 'status' => 'cancelled']);
            } else if ($status == 'cancel') {
                $order->update(['payment_status' => 'cancel', 'status' => 'cancelled']);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
