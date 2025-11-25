import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { Cart, Address } from "../types";

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

const SHIPPING_FEE = 30000; // 30,000 VND

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cartRes, addressesRes] = await Promise.all([
        api.get("/cart"),
        api.get("/addresses"),
      ]);

      if (cartRes.data.success) {
        setCart(cartRes.data.data);
      }

      if (addressesRes.data.success) {
        const addressList = addressesRes.data.data;
        setAddresses(addressList);
        // Auto-select default address
        const defaultAddr = addressList.find((a: Address) => a.is_default);
        setSelectedAddress(defaultAddr || addressList[0] || null);
      }
    } catch (error: any) {
      console.error("Failed to load checkout data:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    console.log("🛒 handlePlaceOrder called");
    console.log("Selected address:", selectedAddress);
    console.log("Cart:", cart);
    console.log("Submitting:", submitting);

    // Validation
    if (!selectedAddress) {
      console.log("❌ No address selected");
      Alert.alert("Thông báo", "Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (!cart || cart.items.length === 0) {
      console.log("❌ Cart is empty");
      Alert.alert("Thông báo", "Giỏ hàng trống");
      return;
    }

    // Check if already submitting
    if (submitting) {
      console.log("❌ Already submitting");
      return;
    }

    console.log("✅ Validation passed");

    // TEMPORARY: For debugging - set to true to skip confirmation
    const SKIP_CONFIRMATION = false;

    // Create order directly (with optional confirmation)
    const createOrderDirectly = async () => {
      try {
        console.log("🚀 Starting order creation...");
        setSubmitting(true);
        
        const orderData = {
          address_id: selectedAddress.id,
          shipping_fee: SHIPPING_FEE,
        };
        
        console.log("📤 Sending order request:", orderData);
        console.log("🌐 API URL:", api.defaults.baseURL);
        console.log("🔑 Checking token...");
        
        // Check token before request
        try {
          const token = await AsyncStorage.getItem("accessToken");
          console.log("🔑 Token exists:", !!token);
          if (token) {
            console.log("🔑 Token preview:", token.substring(0, 20) + "...");
          } else {
            console.warn("⚠️ No token found!");
          }
        } catch (tokenError) {
          console.error("❌ Error checking token:", tokenError);
        }
        
        const response = await api.post("/orders", orderData);
        
        console.log("✅ Order response received:", response.data);

            if (response.data && response.data.success) {
              const orderData = response.data.data;
              const orderId = orderData?.order_id;
              const totalAmount = orderData?.total_amount || 0;
              
              if (orderId) {
            const message = `Đơn hàng ${orderId.substring(0, 8).toUpperCase()} đã được tạo thành công.\nTổng tiền: ${totalAmount.toLocaleString(
              "vi-VN"
            )}đ`;
            setSuccessMessage(message);

            // Clear cart on backend and update UI
            try {
              await api.delete("/cart");
              setCart(null);
            } catch (clearError) {
              console.error("⚠️ Failed to clear cart:", clearError);
            }

            // Navigate to Orders tab after a short delay
            setTimeout(() => {
              (navigation.navigate as any)("Main", {
                screen: "OrdersTab",
              });

              // Optional: navigate to order detail after reaching orders tab
              setTimeout(() => {
                (navigation.navigate as any)("OrderDetail", {
                  orderId,
                });
              }, 400);

              // Reset success banner
              setTimeout(() => {
                setSuccessMessage(null);
              }, 1500);
            }, 1200);
              } else {
            setSuccessMessage("Đơn hàng đã được tạo thành công!");
            setTimeout(() => setSuccessMessage(null), 1500);
              }
            } else {
              Alert.alert(
                "Lỗi",
                response.data?.message || "Không thể tạo đơn hàng"
              );
            }
          } catch (error: any) {
            console.error("❌ Failed to create order:", error);
            console.error("Error details:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
              config: {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL,
              },
            });
            
            const errorMessage = 
              error.response?.data?.message || 
              error.response?.data?.error ||
              error.message || 
              "Không thể tạo đơn hàng. Vui lòng thử lại.";
            
            console.log("📢 Showing error alert:", errorMessage);
            Alert.alert("Lỗi", errorMessage);
          } finally {
            console.log("🏁 Order creation finished");
            setSubmitting(false);
          }
    };

    // For debugging: Direct order creation without confirmation
    if (SKIP_CONFIRMATION) {
      console.log("🚀 Skipping confirmation, creating order directly...");
      createOrderDirectly();
      return;
    }

    // Show confirmation - use window.confirm for web, Alert.alert for mobile
    if (Platform.OS === "web") {
      // For web, try window.confirm if available, otherwise use Alert
      if (typeof window !== "undefined" && window.confirm) {
        const confirmed = window.confirm("Bạn muốn đặt hàng?");
        if (confirmed) {
          console.log("✅ User confirmed (web)");
          createOrderDirectly();
        } else {
          console.log("❌ User cancelled (web)");
        }
      } else {
        // Fallback to Alert for web
        Alert.alert("Xác nhận đơn hàng", "Bạn muốn đặt hàng?", [
          { 
            text: "Hủy", 
            style: "cancel", 
            onPress: () => console.log("❌ User cancelled") 
          },
          {
            text: "Đặt hàng",
            onPress: createOrderDirectly,
          },
        ]);
      }
    } else {
      Alert.alert("Xác nhận đơn hàng", "Bạn muốn đặt hàng?", [
        { 
          text: "Hủy", 
          style: "cancel", 
          onPress: () => console.log("❌ User cancelled") 
        },
        {
          text: "Đặt hàng",
          onPress: createOrderDirectly,
        },
      ]);
    }
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

  const subtotal = cart ? parseFloat(cart.subtotal) : 0;
  const total = subtotal + SHIPPING_FEE;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {successMessage && (
          <View style={styles.successBanner}>
            <Text style={styles.successTitle}>🎉 Đặt hàng thành công</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
          </View>
        )}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📍 Địa chỉ giao hàng</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Addresses" as never)}
              >
                <Text style={styles.changeButton}>Thay đổi</Text>
              </TouchableOpacity>
            </View>

            {selectedAddress ? (
              <View style={styles.addressCard}>
                {selectedAddress.label && (
                  <Text style={styles.addressLabel}>
                    {selectedAddress.label}
                  </Text>
                )}
                <Text style={styles.addressText}>
                  {selectedAddress.address_line}
                </Text>
                <Text style={styles.addressText}>
                  {[
                    selectedAddress.district,
                    selectedAddress.city,
                    selectedAddress.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
                {selectedAddress.phone && (
                  <Text style={styles.addressPhone}>
                    ☎ {selectedAddress.phone}
                  </Text>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => navigation.navigate("Addresses" as never)}
              >
                <Text style={styles.addAddressText}>
                  + Thêm địa chỉ giao hàng
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Sản phẩm</Text>
            {cart?.items.map((item) => {
              const price = item.sale_price || item.price;
              const itemTotal = price * item.quantity;
              return (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName} numberOfLines={2}>
                    {item.product_name}
                  </Text>
                  <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                  <Text style={styles.orderItemPrice}>
                    {itemTotal.toLocaleString("vi-VN")}đ
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Payment Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Thanh toán</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>
                {subtotal.toLocaleString("vi-VN")}đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
              <Text style={styles.summaryValue}>
                {SHIPPING_FEE.toLocaleString("vi-VN")}đ
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {total.toLocaleString("vi-VN")}đ
              </Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentLabel}>Phương thức:</Text>
              <Text style={styles.paymentValue}>💵 Thanh toán khi nhận hàng (COD)</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerTotal}>
            <Text style={styles.footerLabel}>Tổng thanh toán:</Text>
            <Text style={styles.footerAmount}>
              {total.toLocaleString("vi-VN")}đ
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              (submitting || !selectedAddress || !cart || cart.items.length === 0) && styles.placeOrderButtonDisabled,
            ]}
            onPress={(e) => {
              console.log("🔘 Button pressed!", e);
              console.log("Button state:", { submitting, selectedAddress: !!selectedAddress, cart: !!cart });
              handlePlaceOrder();
            }}
            disabled={submitting || !selectedAddress || !cart || cart.items.length === 0}
            activeOpacity={0.7}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.placeOrderText}>Đặt hàng</Text>
            )}
          </TouchableOpacity>
        </View>
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
  successBanner: {
    backgroundColor: COLORS.success,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  successTitle: {
    color: COLORS.white,
    fontSize: SIZES.lg + 2,
    fontWeight: "bold",
  },
  successMessage: {
    color: COLORS.white,
    marginTop: 6,
    fontSize: SIZES.md,
    lineHeight: 20,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.lg + 2,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: SIZES.padding,
  },
  changeButton: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: "600",
  },
  addressCard: {
    backgroundColor: COLORS.light,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.accent,
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
  addAddressButton: {
    backgroundColor: COLORS.light,
    padding: SIZES.padding + 4,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    alignItems: "center",
  },
  addAddressText: {
    fontSize: SIZES.md + 1,
    color: COLORS.primary,
    fontWeight: "600",
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  orderItemName: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.dark,
  },
  orderItemQty: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginHorizontal: SIZES.padding,
  },
  orderItemPrice: {
    fontSize: SIZES.md + 1,
    fontWeight: "600",
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
  paymentMethod: {
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
  footer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding + 4,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  footerTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  footerLabel: {
    fontSize: SIZES.lg,
    fontWeight: "600",
    color: COLORS.dark,
  },
  footerAmount: {
    fontSize: SIZES.xl + 4,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius + 4,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  placeOrderButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  placeOrderText: {
    color: COLORS.white,
    fontSize: SIZES.lg + 2,
    fontWeight: "bold",
  },
});
