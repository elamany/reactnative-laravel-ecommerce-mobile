import * as SecureStore from "expo-secure-store";
import client from "./client";
import { User } from "../types";

interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<User> {
    const res = await client.post<AuthResponse>("/login", {
      email,
      password,
    });
    return persistAuth(res.data);
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const res = await client.post<AuthResponse>("/register", {
      name,
      email,
      password,
    });
    //TODO account confirmation
    return persistAuth(res.data);
  },

  async logout(): Promise<void> {
    try {
      await client.post('/logout');
    } catch {
      // Server logout failure should not prevent local logout.
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
    }
  },

  async getStoredUser(): Promise<User | null> {
    const raw = await SecureStore.getItemAsync("auth_user");
    return raw ? (JSON.parse(raw) as User) : null;
  },
};

// Shared by login and register — both give us the same payload.
async function persistAuth(data: AuthResponse): Promise<User> {
  await SecureStore.setItemAsync("auth_token", data.token);
  await SecureStore.setItemAsync("auth_user", JSON.stringify(data.user));
  return data.user;
}
