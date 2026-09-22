import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      // Server responded with a status outside 2xx.
      // Laravel sends { message: "..." } for most 4xx/5xx responses.
      const message =
        error.response.data?.message ??
        `Request failed (${error.response.status})`;
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(
        new Error('Network error. Check your connection.')
      );
    }
    // Something else went wrong (bad config, etc).
    return Promise.reject(new Error('Something went wrong.'));
  }
);

export default client;