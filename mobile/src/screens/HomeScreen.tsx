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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { Product, Category, Brand } from "../types";
import { API_ENDPOINTS } from "../constants/api";
import { COLORS, SIZES } from "../constants/theme";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory]);

  const loadData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get(API_ENDPOINTS.CATEGORIES),
        api.get(API_ENDPOINTS.BRANDS),
      ]);
      setCategories(categoriesRes.data.categories);
      setBrands(brandsRes.data.brands);
      await loadProducts();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const params: any = { limit: 20 };
      if (searchQuery) params.query = searchQuery;
      if (selectedCategory) params.category = selectedCategory;

      const response = await api.get(API_ENDPOINTS.PRODUCTS, { params });
      setProducts(response.data.products);
    } catch (error) {
      console.error("Load products error:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Reload both categories/brands and products
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get(API_ENDPOINTS.CATEGORIES),
        api.get(API_ENDPOINTS.BRANDS),
      ]);
      setCategories(categoriesRes.data.categories);
      setBrands(brandsRes.data.brands);

      await loadProducts();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể làm mới dữ liệu");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUrl = item.images[0]?.url || "https://via.placeholder.com/150";
    const displayPrice = item.sale_price || item.price;
    const hasDiscount = !!item.sale_price;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          (navigation as any).navigate("ProductDetail", { productId: item.id })
        }
      >
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.brandName}>{item.brand_name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(displayPrice)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.price)}
              </Text>
            )}
          </View>
          {item.stock !== undefined && item.stock > 0 && (
            <Text style={styles.stock}>Còn {item.stock} sản phẩm</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.slug && styles.categoryChipActive,
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === item.slug ? null : item.slug)
      }
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.slug && styles.categoryTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cửa hàng cơ khí</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
          contentContainerStyle={styles.categoryListContent}
        />

        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Đang làm mới..."
              titleColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding + 4,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius + 4,
    padding: 14,
    fontSize: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryList: {
    height: 120,
    maxHeight: 120,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  categoryListContent: {
    padding: SIZES.padding + 4,
    height: 85,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#FFE4B5", // Peach/Moccasin - better contrast
    marginRight: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: SIZES.sm + 2,
    color: COLORS.dark,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: "700",
  },
  productList: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius + 4,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  productImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
    backgroundColor: COLORS.light,
  },
  productInfo: {
    padding: 14,
  },
  productName: {
    fontSize: SIZES.md + 1,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 6,
  },
  brandName: {
    fontSize: SIZES.sm + 1,
    color: COLORS.gray,
    marginBottom: 10,
    fontWeight: "500",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  price: {
    fontSize: SIZES.md + 2,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  stock: {
    fontSize: SIZES.xs + 1,
    color: COLORS.success,
    marginTop: 6,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 50,
  },
  emptyText: {
    fontSize: SIZES.md + 2,
    color: COLORS.gray,
    fontWeight: "500",
  },
});
