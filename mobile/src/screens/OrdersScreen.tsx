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

const COLORS = {
  primary: "#FF8C00",
  accent: "#FFD700",
  background: "#FFFAF0",
  white: "#FFFFFF",
  dark: "#2C3E50",
  gray: "#7F8C8D",
  light: "#ECF0F1",
  border: "#FFE4B5",
  success: "#27AE60",
  warning: "#F39C12",
  danger: "#E74C3C",
  info: "#3498DB",
};

const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  padding: 16,
  borderRadius: 12,
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
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
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
    const statusColor = STATUS_COLORS[item.status] || COLORS.gray;
    const statusLabel = STATUS_LABELS[item.status] || item.status;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          (navigation.navigate as any)("OrderDetail", { orderId: item.id })
        }
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Đơn hàng #{item.id.slice(0, 8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderDate}>
            📅 {new Date(item.created_at).toLocaleDateString("vi-VN")}
          </Text>
          <Text style={styles.itemCount}>📦 {item.item_count} sản phẩm</Text>
        </View>

        {item.address_line && (
          <Text style={styles.orderAddress} numberOfLines={1}>
            📍 {item.address_line}, {item.city}
          </Text>
        )}

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Tổng:</Text>
          <Text style={styles.totalAmount}>
            {parseFloat(item.total_amount.toString()).toLocaleString("vi-VN")}đ
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding * 2,
  },
  loadingText: {
    marginTop: SIZES.padding,
    fontSize: SIZES.md,
    color: COLORS.gray,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding + 4,
    borderBottomLeftRadius: SIZES.borderRadius + 8,
    borderBottomRightRadius: SIZES.borderRadius + 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
  },
  list: {
    padding: SIZES.padding,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  orderId: {
    fontSize: SIZES.md + 2,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.borderRadius,
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.sm + 1,
    fontWeight: "600",
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderDate: {
    fontSize: SIZES.sm + 1,
    color: COLORS.gray,
  },
  itemCount: {
    fontSize: SIZES.sm + 1,
    color: COLORS.gray,
  },
  orderAddress: {
    fontSize: SIZES.sm + 1,
    color: COLORS.gray,
    marginBottom: SIZES.padding,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  totalLabel: {
    fontSize: SIZES.md + 1,
    fontWeight: "600",
    color: COLORS.dark,
  },
  totalAmount: {
    fontSize: SIZES.lg + 2,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.lg + 2,
    color: COLORS.gray,
  },
});
