import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { Product } from "../types";
import { COLORS, SIZES } from "../constants/theme";

export default function AdminProductsScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      const response = await api.get("/products");
      const list = response.data.products || response.data?.data || [];
      setProducts(list);
    } catch (error) {
      console.error("Failed to load products:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleDelete = (product: Product) => {
    Alert.alert(
      "Xóa sản phẩm",
      `Bạn có chắc muốn xóa "${product.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/products/${product.id}`);
              Alert.alert("Thành công", "Đã xóa sản phẩm");
              loadProducts();
            } catch (error: any) {
              console.error("Delete product error:", error);
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể xóa sản phẩm"
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {(item.sale_price || item.price).toLocaleString("vi-VN")}đ
        </Text>
        <Text style={styles.productStock}>
          Tồn kho: {item.stock ?? "—"}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() =>
            navigation.navigate("AdminProductForm" as never, {
              product: item,
            } as never)
          }
        >
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý sản phẩm</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AdminProductForm" as never)}
        >
          <Text style={styles.addButtonText}>+ Thêm sản phẩm</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadProducts();
              }}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có sản phẩm nào.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: SIZES.borderRadius,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  listContent: {
    padding: SIZES.padding,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.gray,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.gray,
    marginTop: 40,
  },
  productCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.padding,
    flexDirection: "row",
  },
  productName: {
    fontSize: SIZES.md + 2,
    fontWeight: "600",
    color: COLORS.dark,
  },
  productPrice: {
    marginTop: 4,
    color: COLORS.primary,
    fontWeight: "600",
  },
  productStock: {
    marginTop: 4,
    color: COLORS.gray,
  },
  actions: {
    justifyContent: "space-between",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: COLORS.info || "#3498DB",
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  actionText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

