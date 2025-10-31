import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { Cart, CartItem } from "../types";

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
  danger: "#E74C3C",
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

export default function CartScreen() {
  const navigation = useNavigation();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to load cart:", error);
      Alert.alert("Lỗi", "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(itemId);
      await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      await loadCart();
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể cập nhật số lượng"
      );
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    Alert.alert("Xác nhận", "Bạn muốn xóa sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setUpdating(itemId);
            await api.delete(`/cart/items/${itemId}`);
            await loadCart();
          } catch (error: any) {
            console.error("Failed to remove item:", error);
            Alert.alert("Lỗi", "Không thể xóa sản phẩm");
          } finally {
            setUpdating(null);
          }
        },
      },
    ]);
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng trống");
      return;
    }
    navigation.navigate("Checkout" as never);
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const price = item.sale_price || item.price;
    const total = price * item.quantity;
    const isUpdating = updating === item.id;

    return (
      <View style={styles.cartItem}>
        <Image
          source={{
            uri: item.image_url || "https://via.placeholder.com/80",
          }}
          style={styles.itemImage}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product_name}
          </Text>
          {item.brand_name && (
            <Text style={styles.brandName}>{item.brand_name}</Text>
          )}

          <Text style={styles.stockInfo}>Còn {item.stock} sản phẩm</Text>
        </View>

        <View style={styles.itemActions}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>
              {isUpdating ? "..." : item.quantity}
            </Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.stock}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.itemTotal}>{total.toLocaleString("vi-VN")}đ</Text>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item.id)}
            disabled={isUpdating}
          >
            <Text style={styles.removeButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          {cart && cart.items.length > 0 && (
            <Text style={styles.itemCount}>{cart.item_count} sản phẩm</Text>
          )}
        </View>

        {!cart || cart.items.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>🛒</Text>
            <Text style={styles.emptyMessage}>Giỏ hàng trống</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() =>
                (navigation.navigate as any)("Main", { screen: "HomeTab" })
              }
            >
              <Text style={styles.shopButtonText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cart.items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tạm tính:</Text>
                <Text style={styles.totalAmount}>
                  {parseFloat(cart.subtotal).toLocaleString("vi-VN")}đ
                </Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>Thanh toán</Text>
              </TouchableOpacity>
            </View>
          </>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  itemCount: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: "600",
  },
  list: {
    padding: SIZES.padding,
  },
  cartItem: {
    flexDirection: "row",
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
  itemImage: {
    width: 80,
    height: 90,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.light,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  itemName: {
    fontSize: SIZES.md + 1,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 4,
  },
  brandName: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: SIZES.md + 1,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  stockInfo: {
    fontSize: SIZES.xs + 1,
    color: COLORS.success,
    fontWeight: "600",
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius - 2,
  },
  quantityButtonText: {
    fontSize: SIZES.lg + 2,
    fontWeight: "bold",
    color: COLORS.white,
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: SIZES.md + 1,
    fontWeight: "600",
    color: COLORS.dark,
  },
  itemTotal: {
    fontSize: SIZES.md + 2,
    fontWeight: "bold",
    color: COLORS.dark,
    marginVertical: 8,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.danger,
    borderRadius: SIZES.borderRadius,
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: SIZES.sm + 1,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 64,
    marginBottom: SIZES.padding,
  },
  emptyMessage: {
    fontSize: SIZES.lg + 2,
    color: COLORS.gray,
    marginBottom: SIZES.padding * 2,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: SIZES.borderRadius + 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md + 2,
    fontWeight: "bold",
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
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  totalLabel: {
    fontSize: SIZES.lg + 2,
    fontWeight: "600",
    color: COLORS.dark,
  },
  totalAmount: {
    fontSize: SIZES.xl + 4,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  checkoutButton: {
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
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: SIZES.lg + 2,
    fontWeight: "bold",
  },
});
