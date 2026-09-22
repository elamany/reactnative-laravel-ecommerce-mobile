<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * GET /api/cart
     * Returns the current user's cart items with full product details.
     */
    public function index(Request $request)
    {
        $items = CartItem::with('product')
            ->where('user_id', $request->user()->id)
            ->orderBy('id')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => (float) $item->product->price,
                    'image_url' => $item->product->image_url,
                    'quantity' => $item->quantity,
                    'subtotal' => (float) ($item->product->price * $item->quantity),
                ];
            });

        return response()->json([
            'items' => $items,
            'total' => (float) $items->sum('subtotal'),
        ]);
    }

    /**
     * POST /api/cart
     * Body: { product_id, quantity? }
     * Adds a product to the cart, or increases quantity if it already exists.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $quantity = $data['quantity'] ?? 1;

        $existing = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($existing) {
            $existing->increment('quantity', $quantity);
            $item = $existing->fresh();
        } else {
            $item = CartItem::create([
                'user_id' => $request->user()->id,
                'product_id' => $data['product_id'],
                'quantity' => $quantity,
            ]);
        }

        return response()->json([
            'message' => 'Item added to cart.',
            'item' => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
            ],
        ], 201);
    }

    /**
     * PATCH /api/cart/{id}
     * Body: { quantity }
     * Sets the quantity of an item. If quantity is 0, deletes the item.
     */
    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $item = CartItem::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$item) {
            return response()->json(['message' => 'Item not found.'], 404);
        }

        if ($data['quantity'] === 0) {
            $item->delete();
            return response()->json(['message' => 'Item removed.']);
        }

        $item->update(['quantity' => $data['quantity']]);

        return response()->json([
            'message' => 'Quantity updated.',
            'item' => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
            ],
        ]);
    }

    /**
     * DELETE /api/cart/{id}
     * Removes an item from the cart.
     */
    public function destroy(Request $request, int $id)
    {
        $item = CartItem::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$item) {
            return response()->json(['message' => 'Item not found.'], 404);
        }

        $item->delete();

        return response()->json(['message' => 'Item removed.']);
    }

    /**
     * DELETE /api/cart
     * Empties the entire cart for the current user.
     */
    public function clear(Request $request)
    {
        CartItem::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Cart cleared.']);
    }
}
