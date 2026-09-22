<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{

    public function show(int $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return response()->json($product);
    }
    /**
     * GET /api/products?page=1&per_page=10
     * Public — no auth required.
     *
     * Returns a paginated envelope:
     *   {
     *     data: [...],
     *     current_page: 1,
     *     last_page: 5,
     *     per_page: 10,
     *     total: 47,
     *     has_more: true
     *   }
     */
    public function index(Request $request)
    {
        // Clamp per_page to a sane range — never trust client input.
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $paginated = Product::orderBy('id')->paginate($perPage);

        return response()->json([
            'data' => $paginated->items(),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
            'has_more' => $paginated->hasMorePages(),
        ]);
    }
}
