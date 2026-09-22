import client from './client';
import { CartResponse } from '../types';

export const cartApi = {
  async get(): Promise<CartResponse> {
    const res = await client.get<CartResponse>('/cart');
    return res.data;
  },

  async add(productId: number, quantity: number = 1): Promise<void> {
    await client.post('/cart', { product_id: productId, quantity });
  },

  async updateQuantity(itemId: number, quantity: number): Promise<void> {
    await client.patch(`/cart/${itemId}`, { quantity });
  },

  async remove(itemId: number): Promise<void> {
    await client.delete(`/cart/${itemId}`);
  },

  async clear(): Promise<void> {
    await client.delete('/cart');
  },
};