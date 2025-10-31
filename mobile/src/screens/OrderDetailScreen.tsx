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

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
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
    } catch (error) {
      console.error("Failed to load order detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    if (orderDetail?.order.status !== "pending") {
      Alert.alert("Thông báo", "Chỉ có thể hủy đơn hàng đang chờ xác nhận");
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
          } catch (error: any) {
            console.error("Failed to cancel order:", error);
            Alert.alert(
              "Lỗi",
              error.response?.data?.message || "Không thể hủy đơn hàng"
            );
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderDetail) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { order, items } = orderDetail;
  const statusColor = STATUS_COLORS[order.status] || COLORS.gray;
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Status */}
          <View style={styles.section}>
            <View style={styles.statusContainer}>
              <Text style={styles.orderId}>Đơn hàng #{order.id.slice(0, 8)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
            </View>
            <Text style={styles.orderDate}>
              📅 Đặt ngày: {new Date(order.created_at).toLocaleString("vi-VN")}
            </Text>
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Địa chỉ giao hàng</Text>
            <View style={styles.addressBox}>
              {order.address_label && (
                <Text style={styles.addressLabel}>{order.address_label}</Text>
              )}
              <Text style={styles.addressText}>{order.address_line}</Text>
              <Text style={styles.addressText}>
                {[order.district, order.city, order.postal_code]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              {order.delivery_phone && (
                <Text style={styles.addressPhone}>☎ {order.delivery_phone}</Text>
              )}
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Sản phẩm</Text>
            {items.map((item) => (
              <View key={item.id} style={styles.productItem}>
                <Image
                  source={{
                    uri: item.image_url || "https://via.placeholder.com/60",
                  }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.product_name}
                  </Text>
                  <Text style={styles.productQty}>x{item.quantity}</Text>
                  <Text style={styles.productPrice}>
                    {parseFloat(item.unit_price.toString()).toLocaleString(
                      "vi-VN"
                    )}
                    đ
                  </Text>
                </View>
                <Text style={styles.productTotal}>
                  {parseFloat(item.total_price.toString()).toLocaleString(
                    "vi-VN"
                  )}
                  đ
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Thanh toán</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>
                {(
                  parseFloat(order.total_amount.toString()) -
                  parseFloat(order.shipping_fee.toString())
                ).toLocaleString("vi-VN")}
                đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
              <Text style={styles.summaryValue}>
                {parseFloat(order.shipping_fee.toString()).toLocaleString(
                  "vi-VN"
                )}
                đ
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {parseFloat(order.total_amount.toString()).toLocaleString(
                  "vi-VN"
                )}
                đ
              </Text>
            </View>
            <View style={styles.paymentStatus}>
              <Text style={styles.paymentLabel}>Thanh toán:</Text>
              <Text style={styles.paymentValue}>
                {order.payment_status === "paid" ? "✅ Đã thanh toán" : "⏳ Chưa thanh toán"}
              </Text>
            </View>
          </View>

          {/* Cancel Button */}
          {order.status === "pending" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
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
  },
  loadingText: {
    marginTop: SIZES.padding,
    fontSize: SIZES.md,
    color: COLORS.gray,
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.danger,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding + 4,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: SIZES.borderRadius + 8,
    borderBottomRightRadius: SIZES.borderRadius + 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  backButton: {
    fontSize: SIZES.lg,
    color: COLORS.white,
    fontWeight: "600",
    marginRight: SIZES.padding,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: SIZES.lg + 2,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: SIZES.padding,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  orderId: {
    fontSize: SIZES.lg,
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
  orderDate: {
    fontSize: SIZES.sm + 1,
    color: COLORS.gray,
  },
  addressBox: {
    backgroundColor: COLORS.light,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
  },
  addressLabel: {
    fontSize: SIZES.md + 1,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 6,
  },
  addressText: {
    fontSize: SIZES.md,
    color: COLORS.dark,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: SIZES.md,
    color: COLORS.dark,
    fontWeight: "600",
    marginTop: 6,
  },
  productItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.light,
  },
  productInfo: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  productName: {
    fontSize: SIZES.md,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 4,
  },
  productQty: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: SIZES.sm + 1,
    color: COLORS.gray,
  },
  productTotal: {
    fontSize: SIZES.md + 1,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: SIZES.md + 1,
    color: COLORS.dark,
  },
  summaryValue: {
    fontSize: SIZES.md + 1,
    color: COLORS.dark,
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: SIZES.lg + 2,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: SIZES.lg + 2,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  paymentStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    backgroundColor: COLORS.light,
    borderRadius: SIZES.borderRadius,
  },
  paymentLabel: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginRight: 8,
  },
  paymentValue: {
    fontSize: SIZES.md + 1,
    color: COLORS.dark,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
    margin: SIZES.padding,
    paddingVertical: 14,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: "bold",
  },
});
