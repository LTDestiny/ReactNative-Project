import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../services/api";
import { OrderDetail } from "../types";

// ─────────────────────────────────────────────
// THEME – Minimal White UI
// ─────────────────────────────────────────────
const COLORS = {
  primary: "#FF8C00",
  text: "#222",
  textSecondary: "#666",
  muted: "#999",
  background: "#FFFFFF",
  surface: "#F9F9F9",
  border: "#E8E8E8",
  light: "#F2F2F2",
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

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const { orderId } = useRoute().params as { orderId: string };

  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      if (response.data.success) {
        setOrderDetail(response.data.data);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    if (orderDetail?.order.status !== "pending") {
      Alert.alert("Thông báo", "Chỉ hủy được đơn hàng đang chờ xác nhận");
      return;
    }

    Alert.alert("Xác nhận", "Bạn muốn hủy đơn hàng này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy đơn",
        style: "destructive",
        onPress: async () => {
          try {
            setCancelling(true);
            await api.post(`/orders/${orderId}/cancel`);
            Alert.alert("Thành công", "Đơn hàng đã được hủy", [
              { text: "OK", onPress: () => loadOrderDetail() },
            ]);
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );

  if (!orderDetail)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );

  const { order, items } = orderDetail;

  const statusColor = STATUS_COLORS[order.status];
  const statusLabel = STATUS_LABELS[order.status];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* STATUS */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.orderId}>Đơn hàng #{order.id.slice(0, 8)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.subInfo}>
            📅 {new Date(order.created_at).toLocaleString("vi-VN")}
          </Text>
        </View>

        {/* ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Địa chỉ giao hàng</Text>
          <View style={styles.addressBox}>
            {order.address_label && (
              <Text style={styles.addressLabel}>{order.address_label}</Text>
            )}
            <Text style={styles.addressLine}>{order.address_line}</Text>
            <Text style={styles.addressLine}>
              {[order.district, order.city, order.postal_code]
                .filter(Boolean)
                .join(", ")}
            </Text>
            {order.delivery_phone && (
              <Text style={styles.addressPhone}>☎ {order.delivery_phone}</Text>
            )}
          </View>
        </View>

        {/* ITEMS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Sản phẩm</Text>

          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image
                source={{
                  uri: item.image_url || "https://via.placeholder.com/60",
                }}
                style={styles.itemImage}
              />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product_name}
                </Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>

              <Text style={styles.itemPrice}>
                {parseFloat(item.total_price.toString()).toLocaleString("vi-VN")}đ
              </Text>
            </View>
          ))}
        </View>

        {/* SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Thanh toán</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>
              {(
                parseFloat(order.total_amount.toString()) -
                parseFloat(order.shipping_fee.toString())
              ).toLocaleString("vi-VN")}
              đ
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
            <Text style={styles.summaryValue}>
              {parseFloat(order.shipping_fee.toString()).toLocaleString("vi-VN")}đ
            </Text>
          </View>

          <View style={[styles.rowBetween, styles.totalBox]}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>
              {parseFloat(order.total_amount.toString()).toLocaleString("vi-VN")}đ
            </Text>
          </View>

          <Text style={styles.paymentStatus}>
            {order.payment_status === "paid"
              ? "💵 Đã thanh toán"
              : "⏳ Chưa thanh toán"}
          </Text>
        </View>

        {/* CANCEL */}
        {order.status === "pending" && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.cancelText}>Hủy đơn hàng</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES – Ultra Minimal
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  backBtn: {
    fontSize: 26,
    marginRight: 12,
    color: COLORS.text,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  loadingText: { marginTop: 10, color: COLORS.textSecondary },

  errorText: { color: COLORS.danger, fontSize: 18 },

  section: {
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
  },

  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: "700",
    marginBottom: 12,
    color: COLORS.text,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontSize: SIZES.lg,
    fontWeight: "700",
    color: COLORS.text,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: { color: "#fff", fontWeight: "600" },

  subInfo: {
    marginTop: 8,
    color: COLORS.textSecondary,
  },

  addressBox: {
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
  },

  addressLabel: {
    fontWeight: "700",
    fontSize: SIZES.md,
    color: COLORS.primary,
    marginBottom: 4,
  },

  addressLine: {
    color: COLORS.text,
    marginBottom: 3,
  },

  addressPhone: {
    color: COLORS.text,
    marginTop: 4,
    fontWeight: "600",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  itemImage: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },

  itemName: { fontSize: SIZES.md, fontWeight: "600", color: COLORS.text },

  itemQty: { color: COLORS.textSecondary, fontSize: SIZES.sm },

  itemPrice: {
    fontWeight: "700",
    fontSize: SIZES.md,
    color: COLORS.primary,
  },

  summaryLabel: { color: COLORS.text, fontSize: SIZES.md },

  summaryValue: { fontWeight: "600", color: COLORS.text },

  totalBox: {
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  totalLabel: { fontSize: SIZES.lg, fontWeight: "700", color: COLORS.text },

  totalValue: {
    fontSize: SIZES.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },

  paymentStatus: {
    marginTop: 12,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },

  cancelBtn: {
    margin: SIZES.padding,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.danger,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: SIZES.md,
  },
});
