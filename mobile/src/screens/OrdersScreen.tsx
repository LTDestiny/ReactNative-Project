import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { Order } from "../types";

// ──────────────────────────────────────────
// THEME — Ultra Minimal White UI
// ──────────────────────────────────────────
const COLORS = {
  primary: "#FF8C00",
  text: "#222",
  textSecondary: "#666",
  muted: "#999",
  background: "#FFFFFF",
  surface: "#F6F6F6",
  border: "#EAEAEA",
  success: "#2ECC71",
  warning: "#F39C12",
  danger: "#E74C3C",
  info: "#3498DB",
};

const SIZES = {
  sm: 12,
  md: 15,
  lg: 17,
  xl: 20,
  padding: 18,
  radius: 12,
};

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning,
  confirmed: COLORS.info,
  shipping: COLORS.primary,
  delivered: COLORS.success,
  cancelled: COLORS.danger,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export default function OrdersScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      if (response.data.success) setOrders(response.data.data);
    } catch {
      console.log("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const renderOrder = ({ item }: { item: Order }) => {
    const statusColor = STATUS_COLORS[item.status] || COLORS.textSecondary;
    const statusLabel = STATUS_LABELS[item.status] || item.status;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          (navigation.navigate as any)("OrderDetail", { orderId: item.id })
        }
      >
        {/* Row 1 */}
        <View style={styles.rowBetween}>
          <Text style={styles.orderId}>Đơn hàng #{item.id.slice(0, 8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.rowBetween}>
          <Text style={styles.subInfo}>
            📅 {new Date(item.created_at).toLocaleDateString("vi-VN")}
          </Text>
          <Text style={styles.subInfo}>📦 {item.item_count} sản phẩm</Text>
        </View>

        {/* Row 3 */}
        {item.address_line && (
          <Text style={styles.address} numberOfLines={1}>
            📍 {item.address_line}
          </Text>
        )}

        <View style={styles.divider} />

        {/* Row 4 */}
        <View style={styles.rowBetween}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalAmount}>
            {parseFloat(item.total_amount.toString()).toLocaleString("vi-VN")}đ
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SIZES.padding }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────
// STYLES (Ultra Minimal)
// ──────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 8,
  },

  // HEADER
  header: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },

  // CARD
  card: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  orderId: {
    fontSize: SIZES.md + 1,
    fontWeight: "700",
    color: COLORS.text,
  },

  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  statusText: {
    color: "#fff",
    fontSize: SIZES.sm,
    fontWeight: "600",
  },

  subInfo: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },

  address: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: SIZES.md + 1,
    color: COLORS.textSecondary,
  },

  totalAmount: {
    fontSize: SIZES.xl,
    fontWeight: "700",
    color: COLORS.primary,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
});
