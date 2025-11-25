import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { Cart, Address } from "../types";

// ──────────────────────────────────────────
// THEME — Ultra Minimal White UI
// ──────────────────────────────────────────
const COLORS = {
  primary: "#FF8C00",
  background: "#FFFFFF",
  surface: "#F7F7F7",
  text: "#222",
  textSecondary: "#555",
  muted: "#999",
  border: "#EAEAEA",
  success: "#2ecc71",
};

const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  padding: 18,
  radius: 12,
};

const SHIPPING_FEE = 30000;

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cartRes, addrRes] = await Promise.all([
        api.get("/cart"),
        api.get("/addresses"),
      ]);

      if (cartRes.data.success) setCart(cartRes.data.data);

      if (addrRes.data.success) {
        const list = addrRes.data.data;
        setAddresses(list);
        const defaultAddr = list.find((a: Address) => a.is_default);
        setSelectedAddress(defaultAddr || list[0] || null);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải thông tin thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Thông báo", "Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (!cart || cart.items.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng trống");
      return;
    }

    Alert.alert("Xác nhận", "Bạn muốn đặt hàng?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đặt hàng",
        onPress: async () => {
          try {
            setSubmitting(true);
            const response = await api.post("/orders", {
              address_id: selectedAddress.id,
              shipping_fee: SHIPPING_FEE,
            });

            if (response.data.success) {
              Alert.alert("Thành công", "Đơn hàng đã được tạo!", [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("Orders" as never),
                },
              ]);
            }
          } catch (err: any) {
            Alert.alert("Lỗi", "Không thể tạo đơn hàng");
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = cart ? parseFloat(cart.subtotal) : 0;
  const total = subtotal + SHIPPING_FEE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Addresses" as never)}>
              <Text style={styles.link}>Thay đổi</Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressBox}>
              <Text style={styles.addrMain}>{selectedAddress.address_line}</Text>
              <Text style={styles.addrSub}>
                {[selectedAddress.district, selectedAddress.city]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              {selectedAddress.phone && (
                <Text style={styles.addrPhone}>📞 {selectedAddress.phone}</Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addAddress}
              onPress={() => navigation.navigate("Addresses" as never)}
            >
              <Text style={styles.addAddressText}>+ Thêm địa chỉ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          {cart?.items.map((item) => {
            const price = item.sale_price || item.price;
            const totalItem = price * item.quantity;
            return (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  {totalItem.toLocaleString("vi-VN")}đ
                </Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng kết</Text>

          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Tạm tính</Text>
            <Text style={styles.sumValue}>
              {subtotal.toLocaleString("vi-VN")}đ
            </Text>
          </View>

          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Phí vận chuyển</Text>
            <Text style={styles.sumValue}>
              {SHIPPING_FEE.toLocaleString("vi-VN")}đ
            </Text>
          </View>

          <View style={[styles.sumRow, styles.sumTotalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalAmount}>
              {total.toLocaleString("vi-VN")}đ
            </Text>
          </View>

          <View style={styles.paymentBox}>
            <Text style={styles.payLabel}>Phương thức:</Text>
            <Text style={styles.payValue}>Thanh toán khi nhận hàng (COD)</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerAmount}>
            {total.toLocaleString("vi-VN")}đ
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.orderBtn, (submitting || !selectedAddress) && styles.orderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={submitting || !selectedAddress}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.orderText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────
// STYLES — Ultra Minimal / Option C
// ──────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: SIZES.md,
    color: COLORS.muted,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  back: {
    fontSize: 24,
    color: COLORS.text,
    marginRight: 12,
    top: -2,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  // SECTIONS
  section: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  link: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },

  addressBox: {
    paddingVertical: 4,
  },

  addrMain: { fontSize: 16, fontWeight: "600", color: COLORS.text },

  addrSub: { fontSize: 15, color: COLORS.textSecondary, marginTop: 2 },

  addrPhone: {
    marginTop: 6,
    color: COLORS.text,
    fontWeight: "600",
  },

  addAddress: {
    paddingVertical: 10,
  },

  addAddressText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // ITEM ROWS
  itemRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  itemName: { flex: 1, fontSize: 16, color: COLORS.text },

  itemQty: { fontSize: 16, color: COLORS.muted, marginHorizontal: 12 },

  itemPrice: { fontSize: 16, color: COLORS.text, fontWeight: "600" },

  // SUMMARY
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  sumLabel: { fontSize: 15, color: COLORS.textSecondary },

  sumValue: { fontSize: 16, color: COLORS.text, fontWeight: "600" },

  sumTotalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 10,
  },

  totalLabel: { fontSize: 18, fontWeight: "700", color: COLORS.text },

  totalAmount: { fontSize: 20, fontWeight: "700", color: COLORS.primary },

  paymentBox: {
    marginTop: 14,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 10,
  },

  payLabel: { color: COLORS.muted, marginBottom: 4 },

  payValue: { fontWeight: "600", color: COLORS.text },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerLabel: { fontSize: 13, color: COLORS.muted },

  footerAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 4,
  },

  orderBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },

  orderBtnDisabled: {
    backgroundColor: COLORS.muted,
  },

  orderText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
