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

import { Colors, Spacing, Radius } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";

export default function CartScreen() {
  const navigation = useNavigation<any>();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // LOAD CART
  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
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

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;

    try {
      setUpdating(itemId);
      await api.put(`/cart/items/${itemId}`, { quantity: newQty });
      await loadCart();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật số lượng");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = (itemId: string) => {
    Alert.alert("Xóa sản phẩm", "Bạn muốn xóa sản phẩm này khỏi giỏ hàng?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setUpdating(itemId);
            await api.delete(`/cart/items/${itemId}`);
            await loadCart();
          } catch {
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
    navigation.navigate("Checkout");
  };

  // RENDER ITEM
  const renderItem = ({ item }: { item: CartItem }) => {
    const price = item.sale_price || item.price;
    const total = price * item.quantity;

    return (
      <View style={styles.item}>
        {/* IMAGE */}
        <Image
          source={{ uri: item.image_url || "https://via.placeholder.com/80" }}
          style={styles.image}
        />

        {/* INFO */}
        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.name}>
            {item.product_name}
          </Text>
          <Text style={styles.brand}>{item.brand_name}</Text>

          <Text style={styles.stock}>Còn {item.stock} sản phẩm</Text>

          {/* TOTAL */}
          <Text style={styles.total}>{total.toLocaleString("vi-VN")}đ</Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <View style={styles.qtyBox}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={updating === item.id || item.quantity <= 1}
            >
              <Ionicons
                name="remove-circle-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>

            <Text style={styles.qtyText}>
              {updating === item.id ? "…" : item.quantity}
            </Text>

            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={updating === item.id || item.quantity >= item.stock}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            disabled={updating === item.id}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loading}>Đang tải giỏ hàng…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Giỏ hàng</Text>
          {cart && cart.items.length > 0 && (
            <Text style={styles.count}>{cart.item_count} sản phẩm</Text>
          )}
        </View>

        {/* EMPTY CART */}
        {!cart || cart.items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cart-outline" size={80} color={Colors.textMuted} />
            <Text style={styles.empty}>Giỏ hàng trống</Text>

            <TouchableOpacity
              style={styles.shopButton}
              onPress={() =>
                navigation.navigate("Main", { screen: "HomeTab" })
              }
            >
              <Text style={styles.shopText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cart.items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />

            {/* FOOTER */}
            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tạm tính</Text>
                <Text style={styles.totalAmount}>
                  {parseFloat(cart.subtotal).toLocaleString("vi-VN")}đ
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutText}>Thanh toán</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  container: {
    flex: 1,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loading: {
    marginTop: 10,
    color: Colors.textMuted,
    fontSize: 16,
  },

  // HEADER
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
  },

  count: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.textMuted,
  },

  // EMPTY CART
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },

  empty: {
    marginTop: 10,
    fontSize: 22,
    color: Colors.textMuted,
  },

  shopButton: {
    backgroundColor: Colors.primary,
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.md,
  },

  shopText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // LIST
  list: {
    padding: Spacing.md,
  },

  item: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },

  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },

  brand: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },

  stock: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.success,
  },

  total: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },

  actions: {
    justifyContent: "space-between",
    alignItems: "center",
  },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  qtyText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },

  removeButton: {
    marginTop: 6,
  },

  // FOOTER
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },

  totalLabel: {
    fontSize: 18,
    color: Colors.text,
  },

  totalAmount: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: "700",
  },

  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: "center",
  },

  checkoutText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
