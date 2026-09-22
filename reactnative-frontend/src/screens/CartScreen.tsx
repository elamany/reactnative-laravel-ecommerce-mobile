import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";
import { CartItem } from "../types";
import ProductImage from "@/components/ProductImage";
import { useAuth } from "@/context/AuthContext";
import SignInPrompt from "@/components/SignInPrompt";
import { Ionicons } from "@expo/vector-icons";

export default function CartScreen() {
  const { isAuthenticated } = useAuth();
  const { items, total, isLoading, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <SignInPrompt
        icon="cart-outline"
        title="Sign in to view your cart"
        message="Your cart is tied to your account. Log in to see what you've saved."
      />
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add products from the shop to get started.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CartRow
            item={item}
            onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
            onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
            onRemove={() => removeItem(item.id)}
          />
        )}
      />
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}> ETB {total.toFixed(2)} </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push("/checkout")}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutText}> Proceed to checkout </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Cart</Text>
    </View>
  );
}

function CartRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.row}>
      <ProductImage uri={item.image_url} style={styles.rowImage} />
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.rowPrice}> ETB {item.price.toFixed(2)} </Text>
        <View style={styles.rowBottom}>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepButton} onPress={onDecrement}>
              <Text style={styles.stepText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepValue}> {item.quantity} </Text>
            <TouchableOpacity style={styles.stepButton} onPress={onIncrement}>
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onRemove} hitSlop={8}>
            <Text style={styles.removeText}> Remove </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rowImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  rowBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  rowName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  rowPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  stepButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#f3f4f6",
  },
  stepText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  stepValue: {
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  removeText: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "600",
  },
  summary: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  checkoutButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
});   