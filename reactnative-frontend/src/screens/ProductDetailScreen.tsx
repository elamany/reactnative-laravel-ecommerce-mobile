import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { productsApi } from "@/api/products";
import { Product } from "@/types";
import ProductImage from "@/components/ProductImage";
import AddToCartButton from "@/components/AddToCartButton";
import QuantitySelector from "@/components/QuantitySelector";
import { useCart } from "@/context/CartContext";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const { items: cartItems } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [quantityTouched, setQuantityTouched] = useState(false);

  // Load the product.
  useEffect(() => {
    if (!productId) {
      setError("Invalid product.");
      setLoading(false);
      return;
    }

    // Reset local state on product change.
    setQuantity(1);
    setQuantityTouched(false);

    (async () => {
      try {
        const data = await productsApi.get(productId);
        setProduct(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    if (quantityTouched) return;

    const inCart = cartItems.find((i) => i.product_id === product.id);
    if (inCart) {
      setQuantity(Math.min(inCart.quantity, product.stock));
    } else {
      setQuantity(1);
    }
  }, [product, cartItems, quantityTouched]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Product not found."}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Product
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <ProductImage uri={product.image_url} style={styles.image} />

        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>

          <Text style={styles.price}>ETB {product.price.toFixed(2)}</Text>

          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>
            {product.description || "No description provided."}
          </Text>

          {product.stock > 0 && (
            <>
              <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                Quantity
                <Text style={styles.stockHint}>
                  {"  "}({product.stock} in stock)
                </Text>
              </Text>
              <QuantitySelector
                value={quantity}
                onIncrement={() => {
                  setQuantityTouched(true);
                  setQuantity((q) => Math.min(q + 1, product.stock));
                }}
                onDecrement={() => {
                  setQuantityTouched(true);
                  setQuantity((q) => Math.max(q - 1, 1));
                }}
                min={1}
                max={product.stock}
                size="large"
              />
            </>
          )}

          {product.stock <= 0 && (
            <View style={styles.soldOutBanner}>
              <Text style={styles.soldOutText}>
                This product is currently sold out.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>
            Total ({quantity} {quantity === 1 ? "item" : "items"})
          </Text>
          <Text style={styles.footerPriceValue}>
            ETB {totalPrice.toFixed(2)}
          </Text>
        </View>
        <View style={styles.footerButton}>
          <AddToCartButton
            productId={product.id}
            quantity={quantity}
            stock={product.stock}
            mode="set" 
            variant="large"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: { padding: 6 },
  backText: { fontSize: 15, color: "#2563EB", fontWeight: "600" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: { width: 56 },

  scroll: { paddingBottom: 24 },
  image: { width: "100%", aspectRatio: 1.2 },
  body: { padding: 20 },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionLabelSpaced: {
    marginTop: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  footerPrice: { flex: 1 },
  footerPriceLabel: { fontSize: 12, color: "#6b7280" },
  footerPriceValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  footerButton: { flex: 1, marginLeft: 12 },
  stockHint: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9ca3af",
    textTransform: "none",
    letterSpacing: 0,
  },
  soldOutBanner: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 14,
    marginTop: 24,
  },
  soldOutText: {
    color: "#991b1b",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
