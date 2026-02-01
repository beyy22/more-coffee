<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\InventoryLog;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends BaseController
{
    public function index(Request $request)
    {
        $logs = InventoryLog::with(['product:id,name,images', 'user:id,name'])
            ->latest()
            ->paginate($request->per_page ?? 20);

        return $this->successResponse($logs, 'Inventory logs retrieved');
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_uuid' => 'required|exists:products,uuid',
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:255'
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $product = Product::where('uuid', $request->product_uuid)->lockForUpdate()->firstOrFail();
                
                $quantityChange = $request->quantity;
                if ($request->type === 'out') { // 'out' means stock reduction
                     $quantityChange = -$quantityChange;
                }
                // adjustment logic could be complex (setting exact value), for now let's assume 'adjustment' is manual correction (+/-)
                // or easier: valid types are 'in' (add) and 'out' (sub). Let's stick to in/out/adjustment where adjustment can be +/- but usually UI handles it.
                // For simplicity MVP: 'in' adds, 'out' subtracts. 

                $product->increment('stock', $quantityChange);
                
                $log = InventoryLog::create([
                    'product_id' => $product->id,
                    'user_id' => $request->user()->id,
                    'type' => $request->type,
                    'quantity' => $quantityChange, // Store actual change (+ or -)
                    'current_stock' => $product->stock,
                    'note' => $request->note
                ]);

                return $this->successResponse($log->load('product'), 'Stock updated successfully', 201);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
