<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * GET /api/orders?page=1&per_page=10
     * Current user's orders, newest first.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $paginated = Order::where('user_id', $request->user()->id)
            ->withCount('items')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $data = collect($paginated->items())->map(function ($order) {
            return [
                'id' => $order->id,
                'tx_ref' => $order->tx_ref,
                'amount' => (float) $order->amount,
                'status' => $order->status,
                'items_count' => $order->items_count,
                'created_at' => $order->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => $data,
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
            'has_more' => $paginated->hasMorePages(),
        ]);
    }

    /**
     * GET /api/orders/{id}
     * Full order with items. Scoped to the current user.
     */
    public function show(Request $request, int $id)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with('items')
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json([
            'id' => $order->id,
            'tx_ref' => $order->tx_ref,
            'amount' => (float) $order->amount,
            'status' => $order->status,
            'checkout_url' => $order->checkout_url,
            'created_at' => $order->created_at->toIso8601String(),
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'price' => (float) $item->price,
                    'quantity' => $item->quantity,
                    'subtotal' => (float) $item->subtotal,
                ];
            }),
        ]);
    }
}
