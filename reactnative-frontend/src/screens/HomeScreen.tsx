import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { productsApi } from "../api/products";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import ListFooter from "../components/ListFooter";
import { useCart } from "@/context/CartContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const PER_PAGE = 10;

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFirstPage = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await productsApi.list(1, PER_PAGE);
      setProducts(result.data);
      setPage(1);
      setHasMore(result.has_more);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await productsApi.list(nextPage, PER_PAGE);
      setProducts((prev) => [...prev, ...result.data]);
      setPage(nextPage);
      setHasMore(result.has_more);
    } catch {
      // Silent — the user can retry by scrolling again.
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadFirstPage()}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        name={user?.name ?? "Shopper"}
        isAuthenticated={!!user}
        onLogout={logout}
      />

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFirstPage(true)}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.errorText}>No products available.</Text>
          </View>
        }
        ListFooterComponent={
          <ListFooter
            loadingMore={loadingMore}
            hasMore={hasMore}
            endText="End of catalog"
          />
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}

function ScreenHeader({
  name,
  isAuthenticated,
  onLogout,
}: {
  name: string;
  isAuthenticated: boolean;
  onLogout: () => void;
}) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>
          {isAuthenticated ? "Hello," : "Welcome,"}
        </Text>
        <Text style={styles.name}>{isAuthenticated ? name : "Guest"}</Text>
      </View>

      <View style={styles.headerRight}>
        {isAuthenticated ? (
          <>
            <OrdersButton />
            <CartBadge />
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>Log in</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function CartBadge() {
  const { count } = useCart();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.cartButton}
      onPress={() => router.push("/cart")}
      activeOpacity={0.7}
    >
      <Ionicons name="cart-outline" size={21} color="#374151" />

      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {count > 99 ? "99+" : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function OrdersButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.ordersButton}
      onPress={() => router.push("/orders")}
      activeOpacity={0.7}
    >
      <Ionicons name="receipt-outline" size={21} color="#374151" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  greeting: { fontSize: 13, color: "#6b7280" },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  logoutText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  listContent: { padding: 12, paddingBottom: 32 },
  row: { justifyContent: "space-between" },
  empty: { padding: 32, alignItems: "center" },
  errorText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  cartButton: {
    position: "relative",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  cartIcon: { fontSize: 20 },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#2563EB",
  },
  loginText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  ordersButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    },
    ordersIcon: { fontSize: 20 },
});
