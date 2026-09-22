import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Product } from "@/types";
import AddToCartButton from "@/components/AddToCartButton";
import ProductImage from "@/components/ProductImage";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <ProductImage uri={product.image_url} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.imageWrapper}>
          <ProductImage uri={product.image_url} style={styles.image} />
          {product.stock <= 0 && (
            <View style={styles.imageOverlay}>
              <Text style={styles.overlayText}>Sold out</Text>
            </View>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>
                Only {product.stock} left
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  image: {
    width: "100%",
    aspectRatio: 1.2,
    backgroundColor: "#f3f4f6",
  },
  body: { padding: 10 },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: { fontSize: 13, fontWeight: "700", color: "#2563EB" },
  imageWrapper: {
    position: "relative",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  stockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockBadgeText: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "700",
  },
});
