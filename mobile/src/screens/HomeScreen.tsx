import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import api from "../services/api";
import { Product, Category } from "../types";
import { API_ENDPOINTS } from "../constants/api";
import { Colors, Spacing, Radius } from "../theme/theme";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory]);

  const loadInitialData = async () => {
    try {
      const categoriesRes = await api.get(API_ENDPOINTS.CATEGORIES);
      setCategories(categoriesRes.data.categories);
      await loadProducts();
    } catch {
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const params: Record<string, any> = { limit: 20 };
      if (searchQuery) params.query = searchQuery;
      if (selectedCategory) params.category = selectedCategory;

      const res = await api.get(API_ENDPOINTS.PRODUCTS, { params });
      setProducts(res.data.products);
    } catch (error) {
      console.log("Load products error:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const categoriesRes = await api.get(API_ENDPOINTS.CATEGORIES);
      setCategories(categoriesRes.data.categories);
      await loadProducts();
    } catch {
      Alert.alert("Lỗi", "Không thể làm mới dữ liệu");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  // RENDER PRODUCT
  const renderProduct = ({ item }: { item: Product }) => {
    const imageUrl = item.images[0]?.url || "https://via.placeholder.com/150";
    const price = item.sale_price || item.price;
    const hasDiscount = !!item.sale_price;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
      >
        <Image source={{ uri: imageUrl }} style={styles.productImage} />

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.brandName}>{item.brand_name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatPrice(price)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>{formatPrice(item.price)}</Text>
            )}
          </View>

          {item.stock > 0 && (
            <Text style={styles.stockText}>Còn {item.stock} sản phẩm</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // RENDER CATEGORY CHIP
  const renderCategory = ({ item }: { item: Category }) => {
    const isActive = selectedCategory === item.slug;

    return (
      <TouchableOpacity
        style={[styles.chip, isActive && styles.chipActive]}
        onPress={() => setSelectedCategory(isActive ? null : item.slug)}
      >
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.page}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* 🔥 HEADER + SEARCH BAR (Shopee style) */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/logonho.png")}
            style={styles.logo}
          />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm sản phẩm, máy móc, phụ tùng..."
            placeholderTextColor="#ccc"
            style={styles.searchInput}
          />
        </View>

        {/* 🔥 BANNER */}
        <Image
          source={require("../../assets/banner.png")}
          style={styles.banner}
          resizeMode="cover"
        />

        {/* 🔥 GIỚI THIỆU ỨNG DỤNG */}
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>🛠️ Ứng dụng cơ khí số 1 Việt Nam</Text>
          <Text style={styles.introText}>
            Mua bán máy móc – phụ kiện – dụng cụ – linh kiện nhanh chóng với giá tốt nhất.
          </Text>
        </View>

        {/* CATEGORY LIST */}
        <FlatList
          data={categories}
          renderItem={renderCategory}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        />

        {/* PRODUCT LIST */}
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

//──────────────────────────────────────────
// STYLES
//──────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  page: { flex: 1, backgroundColor: Colors.background },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  // HEADER SHOPEE STYLE
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    fontSize: 15,
  },

  // BANNER
  banner: {
    width: "100%",
    height: 150,
    marginTop: 10,
    borderRadius: Radius.md,
  },

  // INTRO
  introBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#FFF6E9",
    borderRadius: 12,
    marginHorizontal: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 6,
  },
  introText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },

  // CATEGORY
  categoryRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.text, fontWeight: "600" },
  chipTextActive: { color: Colors.white },

  // PRODUCT ITEM
  productList: { padding: Spacing.md },
  productCard: {
    flex: 1,
    margin: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 150,
    backgroundColor: Colors.surface,
  },
  productInfo: { padding: Spacing.md },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  brandName: { fontSize: 13, color: "#777", marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "center" },
  priceText: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  originalPrice: {
    fontSize: 13,
    marginLeft: 8,
    textDecorationLine: "line-through",
    color: "#999",
  },
  stockText: {
    marginTop: 6,
    fontSize: 12,
    color: "#0A7A1F",
    fontWeight: "600",
  },
  emptyBox: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 16, color: Colors.textMuted },
});
