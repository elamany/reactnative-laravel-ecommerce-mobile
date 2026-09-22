<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChapaService
{
    private string $baseUrl = 'https://api.chapa.co/v1';
    private string $secretKey;

    public function __construct()
    {
        $this->secretKey = config('services.chapa.secret_key');
    }

    /**
     * Initialize a Chapa payment session.
     *
     * @param  array  $data  Chapa's required fields:
     *                       amount, currency, email, first_name, last_name,
     *                       tx_ref, return_url, customization
     * @return array{status: string, message?: string, data?: array}
     */
    public function initialize(array $data): array
    {
        $response = Http::withToken($this->secretKey)
            ->acceptJson()
            ->post("{$this->baseUrl}/transaction/initialize", $data);

        $body = $response->json();

        if (!is_array($body)) {
            Log::error('Chapa initialize: non-JSON response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [
                'status' => 'failed',
                'message' => 'Payment provider returned an unexpected response.',
            ];
        }

        return $body;
    }

    /**
     * Verify a transaction by its tx_ref.
     *
     * @return array{status: string, message?: string, data?: array}
     */
    public function verify(string $txRef): array
    {
        $response = Http::withToken($this->secretKey)
            ->acceptJson()
            ->get("{$this->baseUrl}/transaction/verify/{$txRef}");

        $body = $response->json();

        if (!is_array($body)) {
            Log::error('Chapa verify: non-JSON response', [
                'tx_ref' => $txRef,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [
                'status' => 'failed',
                'message' => 'Verification failed.',
            ];
        }

        return $body;
    }
}
