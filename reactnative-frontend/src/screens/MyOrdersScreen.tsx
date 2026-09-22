import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ordersApi } from "@/api/orders";
import { OrderSummary } from "@/types";
import ListFooter from "@/components/ListFooter";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useAuth } from "@/context/AuthContext";
import SignInPrompt from "@/components/SignInPrompt";
import { Ionicons } from '@expo/vector-icons';

const PER_PAGE = 10;

export default function MyOrdersScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  const loadFirstPage = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const result = await ordersApi.list(1, PER_PAGE);
      setOrders(result.data);
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
      const result = await ordersApi.list(nextPage, PER_PAGE);

      setOrders((prev) => [...prev, ...result.data]);
      setPage(nextPage);
      setHasMore(result.has_more);
    } catch {
      // Silent. The user can retry by scrolling again.
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFirstPage();
    }
  }, [isAuthenticated, loadFirstPage]);

  // Authentication check AFTER all hooks
  if (!isAuthenticated) {
    return (
      <SignInPrompt
        icon="receipt-outline"
        title="Sign in to see your orders"
        message="Your order history is tied to your account."
      />
    );
  }

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFirstPage(true)}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              When you make a purchase, it will show up here.
            </Text>
          </View>
        }
        ListFooterComponent={
          <ListFooter loadingMore={loadingMore} hasMore={hasMore} />
        }
        renderItem={({ item }) => (
          <OrderRow
            order={item}
            onPress={() => router.push(`/orders/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

function OrderRow({
  order,
  onPress,
}: {
  order: OrderSummary;
  onPress: () => void;
}) {
  const date = new Date(order.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Text style={styles.orderNumber}>Order #{order.id}</Text>
        <Text style={styles.orderMeta}>
          {date} · {order.items_count}{" "}
          {order.items_count === 1 ? "item" : "items"}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.amount}>ETB {order.amount.toFixed(2)}</Text>
        <OrderStatusBadge status={order.status} />
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: { padding: 6 },
  backText: { fontSize: 15, color: "#2563EB", fontWeight: "600" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  headerSpacer: { width: 56 },

  list: { padding: 16, paddingBottom: 32 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rowLeft: { flex: 1 },
  rowRight: { alignItems: "flex-end", gap: 6 },
  orderNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  orderMeta: { fontSize: 13, color: "#6b7280" },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 2,
  },

  empty: { padding: 32, alignItems: "center" },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
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
});
