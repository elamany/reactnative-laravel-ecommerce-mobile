<?php

namespace App\Http\Controllers;

use App\Models\IdempotencyKey;
use Illuminate\Database\QueryException;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Services\ChapaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function __construct(private ChapaService $chapa) {}

    /**
     * POST /api/checkout
     * Auth required.
     *
     * No req.body needed. Reads the user's cart from cart_items, creates an
     * Order + OrderItems, initializes Chapa, returns the checkout URL.
     *
     * Returns: { order_id, tx_ref, amount, checkout_url }
     */
    public function checkout(Request $request)
    {
        $user = $request->user();
        $idempotencyKey = $request->header('Idempotency-Key');

        // Replay path (unchanged)
        if ($idempotencyKey) {
            $cached = IdempotencyKey::where('user_id', $user->id)
                ->where('key', $idempotencyKey)
                ->where('created_at', '>', now()->subHours(24))
                ->first();

            if ($cached) {
                return response($cached->response_body, $cached->response_status)
                    ->header('Content-Type', 'application/json')
                    ->header('Idempotent-Replay', 'true');
            }
        }

        try {
            $result = DB::transaction(function () use ($user) {
                $cartItems = CartItem::with('product')
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->get();

                if ($cartItems->isEmpty()) {
                    throw new \RuntimeException('EMPTY_CART');
                }

                // Atomic stock reservation.
                foreach ($cartItems as $item) {
                    $affected = Product::where('id', $item->product_id)
                        ->where('stock', '>=', $item->quantity)
                        ->decrement('stock', $item->quantity);

                    if ($affected === 0) {
                        $currentStock = Product::where('id', $item->product_id)
                            ->value('stock') ?? 0;

                        throw new \RuntimeException(
                            'OUT_OF_STOCK:' . $item->product->name . ':' . $currentStock
                        );
                    }
                }

                $total = 0;
                foreach ($cartItems as $item) {
                    $total += $item->product->price * $item->quantity;
                }

                $txRef = 'ORDER-' . $user->id . '-' . Str::uuid();

                $order = Order::create([
                    'user_id' => $user->id,
                    'tx_ref' => $txRef,
                    'amount' => $total,
                    'status' => 'PENDING',
                ]);

                foreach ($cartItems as $item) {
                    $order->items()->create([
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'price' => $item->product->price,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->product->price * $item->quantity,
                    ]);
                }

                CartItem::where('user_id', $user->id)->delete();

                return ['order' => $order, 'total' => $total, 'tx_ref' => $txRef];
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'EMPTY_CART') {
                return response()->json(['message' => 'Your cart is empty.'], 400);
            }

            if (str_starts_with($e->getMessage(), 'OUT_OF_STOCK:')) {
                [, $productName, $currentStock] = explode(':', $e->getMessage());
                return response()->json([
                    'message' => "Not enough stock for {$productName}. " .
                        "Only {$currentStock} available.",
                ], 400);
            }

            throw $e;
        }

        $order = $result['order'];
        $total = $result['total'];
        $txRef = $result['tx_ref'];

        $response = $this->chapa->initialize([
            'amount' => (string) $total,
            'currency' => 'ETB',
            'email' => $user->email,
            'first_name' => $user->name,
            'last_name' => '',
            'tx_ref' => $txRef,
            'return_url' => config('services.chapa.return_url')
                . '/api/payment/return?tx_ref=' . $txRef,
            'customization' => [
                'title' => 'Demo Shop',
                'description' => 'Order payment',
            ],
        ]);

        if (($response['status'] ?? '') !== 'success') {
            // Roll back the stock reservation — the order never reached Chapa.
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)
                    ->increment('stock', $item->quantity);
            }
            $order->update(['status' => 'FAILED']);

            return response()->json([
                'message' => $response['message'] ?? 'Payment initialization failed.',
            ], 400);
        }

        $order->update([
            'checkout_url' => $response['data']['checkout_url'],
        ]);

        $responseBody = response()->json([
            'order_id' => $order->id,
            'tx_ref' => $txRef,
            'amount' => $total,
            'checkout_url' => $response['data']['checkout_url'],
        ]);

        if ($idempotencyKey) {
            try {
                IdempotencyKey::create([
                    'user_id' => $user->id,
                    'key' => $idempotencyKey,
                    'response_body' => $responseBody->getContent(),
                    'response_status' => $responseBody->getStatusCode(),
                ]);
            } catch (QueryException $e) {
                $existing = IdempotencyKey::where('user_id', $user->id)
                    ->where('key', $idempotencyKey)
                    ->first();

                if ($existing) {
                    return response($existing->response_body, $existing->response_status)
                        ->header('Content-Type', 'application/json')
                        ->header('Idempotent-Replay', 'true');
                }
                throw $e;
            }
        }

        return $responseBody;
    }

    /**
     * GET /api/payment/return?tx_ref=...
     * Chapa redirects the browser here after the user pays (or cancels).
     *
     * Idempotent:
     *   - If the order is already terminal, we just render its state.
     *   - Otherwise we ask Chapa once and settle.
     */
    public function paymentReturn(Request $request)
    {
        $txRef = $request->query('tx_ref');

        if (!$txRef) {
            return $this->htmlResult('ERROR', 'Transaction reference is missing.');
        }

        $order = Order::where('tx_ref', $txRef)->first();

        if (!$order) {
            return $this->htmlResult('ERROR', 'Order not found.');
        }

        // Already settled — don't call Chapa again.
        if (in_array($order->status, ['SUCCESS', 'FAILED'], true)) {
            return $this->htmlResult(
                $order->status,
                $order->status === 'SUCCESS'
                    ? 'Your payment was successful.'
                    : 'Your payment failed.'
            );
        }

        // Ask Chapa.
        try {
            $verify = $this->chapa->verify($txRef);
        } catch (\Throwable $e) {
            Log::error('Chapa verify threw', ['tx_ref' => $txRef, 'error' => $e->getMessage()]);
            return $this->htmlResult('PENDING', 'Could not confirm your payment yet.');
        }

        $chapaStatus = $verify['data']['status'] ?? null;
        $chapaAmount = $verify['data']['amount'] ?? null;
        $chapaCurrency = $verify['data']['currency'] ?? null;

        // Sanity checks: never trust the payload blindly.
        if ($chapaStatus === 'success') {
            if ((float) $chapaAmount !== (float) $order->amount) {
                Log::warning('Amount mismatch on return', [
                    'tx_ref' => $txRef,
                    'expected' => $order->amount,
                    'received' => $chapaAmount,
                ]);
                return $this->htmlResult('ERROR', 'Payment amount mismatch.');
            }

            if ($chapaCurrency && $chapaCurrency !== 'ETB') {
                Log::warning('Currency mismatch on return', [
                    'tx_ref' => $txRef,
                    'expected' => 'ETB',
                    'received' => $chapaCurrency,
                ]);
                return $this->htmlResult('ERROR', 'Unexpected currency.');
            }

            $order->update(['status' => 'SUCCESS']);
            return $this->htmlResult('SUCCESS', 'Your payment was successful.');
        }

        if ($chapaStatus === 'failed') {
            $order->update(['status' => 'FAILED']);
            return $this->htmlResult('FAILED', 'Your payment failed.');
        }

        // Chapa hasn't finalized yet (rare — usually means webhook isn't set).
        return $this->htmlResult('PENDING', 'Payment status could not be confirmed yet.');
    }

    /**
     * Renders the small HTML page the mobile WebView reads.
     * The `<meta name="payment-status">` tag is the contract.
     */
    private function htmlResult(string $status, string $message)
    {
        $status = htmlspecialchars($status, ENT_QUOTES, 'UTF-8');
        $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

        $color = match ($status) {
            'SUCCESS' => '#16A34A',
            'FAILED'  => '#DC2626',
            default   => '#D97706',
        };

        $html = <<<HTML
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta name="payment-status" content="{$status}">
                    <title>{$status}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            margin: 0; min-height: 100vh; display: flex;
                            align-items: center; justify-content: center;
                            padding: 24px; background: #f5f7fa; color: #1f2937;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        }
                        .card {
                            width: 100%; max-width: 400px; padding: 32px 24px;
                            background: #ffffff; border-radius: 16px;
                            box-shadow: 0 8px 30px rgba(0,0,0,0.08); text-align: center;
                        }
                        .dot {
                            width: 64px; height: 64px; margin: 0 auto 20px;
                            display: flex; align-items: center; justify-content: center;
                            border-radius: 50%; font-size: 30px; font-weight: 700;
                            background: {$color}22; color: {$color};
                        }
                        h1 { margin: 0 0 12px; font-size: 22px; }
                        p  { margin: 0; line-height: 1.6; color: #6b7280; }
                        .status {
                            margin-top: 20px; font-size: 12px; font-weight: 700;
                            text-transform: uppercase; letter-spacing: 0.1em;
                            color: {$color};
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="dot">{$status}</div>
                        <h1>{$status}</h1>
                        <p>{$message}</p>
                        <div class="status">{$status}</div>
                    </div>
                </body>
                </html>
                HTML;

        return response($html, 200)->header('Content-Type', 'text/html');
    }
}
