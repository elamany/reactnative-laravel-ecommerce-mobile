import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { cartApi } from "../api/cart";
import { useAuth } from "./AuthContext";
import { CartItem } from "../types";

interface CartContextValue {
  items: CartItem[];
  total: number;
  count: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await cartApi.get();
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart when the user logs in; clear it when they log out.
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setItems([]);
      setTotal(0);
      setError(null);
    }
  }, [isAuthenticated, refresh]);

  const addToCart = useCallback(
    async (productId: number, quantity: number = 1) => {
        await cartApi.add(productId, quantity);
        await refresh();
    },
    [refresh]
    );

    const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
        if (quantity <= 0) {
        await cartApi.remove(itemId);
        } else {
        await cartApi.updateQuantity(itemId, quantity);
        }
        await refresh();
    },
    [refresh]
    );

    const removeItem = useCallback(
    async (itemId: number) => {
        await cartApi.remove(itemId);
        await refresh();
    },
    [refresh]
    );

    const clearCart = useCallback(async () => {
    await cartApi.clear();
    setItems([]);
    setTotal(0);
    }, []);

    const reset = useCallback(() => {
    setItems([]);
    setTotal(0);
    setError(null);
    }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        count,
        isLoading,
        error,
        refresh,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        reset,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
