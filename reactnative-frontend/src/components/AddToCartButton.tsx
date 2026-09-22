import { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import LoginSheet from '@/components/LoginSheet';

interface Props {
  productId: number;
  quantity?: number;
  stock: number;
  variant?: 'compact' | 'large';
  /**
   * 'add' → always adds/increments (used on product cards)
   * 'set' → if the product is already in the cart, shows "Update cart"
   *         and replaces the cart quantity with `quantity`.
   */
  mode?: 'add' | 'set';
}

type ButtonState = 'idle' | 'loading' | 'added';

export default function AddToCartButton({
  productId,
  quantity = 1,
  stock,
  variant = 'compact',
  mode = 'add',
}: Props) {
  const { addToCart, updateQuantity, items } = useCart();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<ButtonState>('idle');
  const [showLoginSheet, setShowLoginSheet] = useState(false);

  const isCompact = variant === 'compact';
  const soldOut = stock <= 0;

  const existingItem = items.find((i) => i.product_id === productId);
  const isUpdateMode = mode === 'set' && !!existingItem;

  async function performAction() {
    setState('loading');
    try {
      if (isUpdateMode && existingItem) {
        await updateQuantity(existingItem.id, quantity);
      } else {
        await addToCart(productId, quantity);
      }
      setState('added');
      setTimeout(() => setState('idle'), 1200);
    } catch {
      setState('idle');
    }
  }

  function handlePress() {
    if (state !== 'idle') return;
    if (soldOut) return;
    if (!isAuthenticated) {
      setShowLoginSheet(true);
      return;
    }
    performAction();
  }

  async function handleLoginSuccess() {
    setShowLoginSheet(false);
    await performAction();
  }

  const label = soldOut
    ? 'Sold out'
    : isUpdateMode
      ? 'Update cart'
      : isCompact
        ? 'Add'
        : 'Add to cart';

  const confirmationLabel = isUpdateMode ? 'Updated ✓' : 'Added ✓';

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={state !== 'idle' || soldOut}
        activeOpacity={0.8}
        style={[
          isCompact ? styles.compact : styles.large,
          state === 'added' && styles.added,
          soldOut && styles.soldOut,
        ]}
      >
        {state === 'loading' && (
          <ActivityIndicator size="small" color="#fff" />
        )}
        {state === 'idle' && (
          <Text style={isCompact ? styles.textCompact : styles.textLarge}>
            {label}
          </Text>
        )}
        {state === 'added' && (
          <Text style={isCompact ? styles.textCompact : styles.textLarge}>
            {confirmationLabel}
          </Text>
        )}
      </TouchableOpacity>

      <LoginSheet
        visible={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  compact: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  added: { backgroundColor: '#16A34A' },
  soldOut: { backgroundColor: '#9ca3af' },
  textCompact: { color: '#fff', fontSize: 12, fontWeight: '700' },
  textLarge: { color: '#fff', fontSize: 16, fontWeight: '700' },
});