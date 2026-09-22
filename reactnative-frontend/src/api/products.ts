import client from '@/api/client';
import { Product, ProductPage } from '@/types';

export const productsApi = {
  async list(page: number = 1, perPage: number = 10): Promise<ProductPage> {
    const res = await client.get<ProductPage>('/products', {
      params: { page, per_page: perPage },
    });
    return res.data;
  },

  async get(id: number): Promise<Product> {
    const res = await client.get<Product>(`/products/${id}`);
    return res.data;
  },
};