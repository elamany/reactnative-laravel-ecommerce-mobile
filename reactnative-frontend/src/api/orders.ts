import client from '@/api/client';
import { OrderDetail, OrderPage } from '@/types';

export const ordersApi = {
  async list(page: number = 1, perPage: number = 10): Promise<OrderPage> {
    const res = await client.get<OrderPage>('/orders', {
      params: { page, per_page: perPage },
    });
    return res.data;
  },

  async get(id: number): Promise<OrderDetail> {
    const res = await client.get<OrderDetail>(`/orders/${id}`);
    return res.data;
  },
};