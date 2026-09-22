import client from '@/api/client';
import { CheckoutResponse } from '@/types';

export const checkoutApi = {
 
  async create(idempotencyKey: string): Promise<CheckoutResponse> {
    const res = await client.post<CheckoutResponse>(
      '/checkout',
      {},
      { headers: { 'Idempotency-Key': idempotencyKey } }
    );
    return res.data;
  },
};