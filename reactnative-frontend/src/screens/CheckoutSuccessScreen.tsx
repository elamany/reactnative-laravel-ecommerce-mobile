import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutSuccessScreen() {
  const router = useRouter();
  const { orderId, amount } = useLocalSearchParams<{
    orderId?: string;
    amount?: string;
  }>();
  const { reset } = useCart();

  // Belt-and-suspenders: make sure local cart is empty.
  // Checkout already cleared it, but this keeps the screen robust
  // if it's ever reached from somewhere else.
  useEffect(() => {
    reset();
  }, [reset]);

  const formattedAmount = amount ? `ETB ${Number(amount).toFixed(2)}` : "";

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={56} color="#16A34A" />
      </View>

      <Text style={styles.title}>Payment successful</Text>
      <Text style={styles.subtitle}>
        Thank you for your order. A receipt has been sent to your email.
      </Text>

      {orderId && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order</Text>
            <Text style={styles.infoValue}>#{orderId}</Text>
          </View>
          {formattedAmount ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>{formattedAmount}</Text>
            </View>
          ) : null}
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/products")}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Continue shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconText: {
    fontSize: 52,
    color: "#16A34A",
    fontWeight: "700",
    lineHeight: 56,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  infoLabel: { fontSize: 14, color: "#6b7280" },
  infoValue: { fontSize: 14, fontWeight: "700", color: "#111827" },
  button: {
    width: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
