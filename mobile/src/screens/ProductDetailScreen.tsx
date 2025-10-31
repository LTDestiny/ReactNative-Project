import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { Product } from "../types";
import { API_ENDPOINTS } from "../constants/api";
import { COLORS, SIZES } from "../constants/theme";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen({ route }: any) {
  const navigation = useNavigation();
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      console.log("Loading product:", productId);
      const response = await api.get(API_ENDPOINTS.PRODUCT_BY_ID(productId));
      console.log("Product loaded:", response.data.product);
      setProduct(response.data.product);
    } catch (error: any) {
      console.error("Error loading product:", error.message);
      Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCT_BY_ID(productId));
      setProduct(response.data.product);
    } catch (error: any) {
      console.error("Error refreshing product:", error.message);
      Alert.alert("Lỗi", "Không thể làm mới thông tin sản phẩm");
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

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await api.post("/cart/items", {
        product_id: productId,
        quantity: 1,
      });
      
      Alert.alert("Thành công", "Đã thêm vào giỏ hàng", [
        { text: "Tiếp tục mua", style: "cancel" },
        {
          text: "Xem giỏ hàng",
          onPress: () => (navigation.navigate as any)("Main", { screen: "CartTab" }),
        },
      ]);
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể thêm vào giỏ hàng"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
        </View>
      </SafeAreaView>
    );
  }

  const images =
    product.images.length > 0
      ? product.images
      : [{ url: "https://via.placeholder.com/400" }];
  const displayPrice = product.sale_price || product.price;
  const hasDiscount = !!product.sale_price;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
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
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[selectedImageIndex].url }}
            style={styles.mainImage}
          />
          {images.length > 1 && (
            <ScrollView horizontal style={styles.thumbnailContainer}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image
                    source={{ uri: img.url }}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.brand}>{product.brand_name}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(displayPrice)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.price)}
              </Text>
            )}
          </View>

          {product.stock !== undefined && (
            <Text
              style={product.stock > 0 ? styles.inStock : styles.outOfStock}
            >
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
            </Text>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>
              {product.description || "Chưa có mô tả"}
            </Text>
          </View>

          {product.avg_rating && product.avg_rating > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <Text style={styles.rating}>
                ⭐ {product.avg_rating.toFixed(1)} ({product.review_count} đánh
                giá)
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              (product.stock === 0 || addingToCart) && styles.buttonDisabled,
            ]}
            disabled={product.stock === 0 || addingToCart}
            onPress={handleAddToCart}
          >
            {addingToCart ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.addToCartText}>
                {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  emptyText: {
    fontSize: SIZES.md + 2,
    color: COLORS.gray,
    fontWeight: "500",
  },
  imageContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  mainImage: {
    width: width,
    height: width,
    resizeMode: "cover",
    backgroundColor: COLORS.light,
  },
  thumbnailContainer: {
    padding: 14,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 3,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: SIZES.padding + 4,
  },
  brand: {
    fontSize: SIZES.sm + 2,
    color: COLORS.gray,
    marginBottom: 6,
    fontWeight: "600",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 14,
    lineHeight: 34,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: SIZES.lg + 2,
    color: COLORS.gray,
    textDecorationLine: "line-through",
    marginLeft: 14,
  },
  inStock: {
    fontSize: SIZES.md + 2,
    color: COLORS.success,
    marginBottom: 24,
    fontWeight: "700",
  },
  outOfStock: {
    fontSize: SIZES.md + 2,
    color: COLORS.danger,
    marginBottom: 24,
    fontWeight: "700",
  },
  section: {
    marginBottom: 28,
    backgroundColor: COLORS.white,
    padding: SIZES.padding + 4,
    borderRadius: SIZES.borderRadius + 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: SIZES.lg + 2,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: SIZES.md + 1,
    color: COLORS.secondary,
    lineHeight: 26,
  },
  rating: {
    fontSize: SIZES.md + 1,
    color: COLORS.dark,
    fontWeight: "600",
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding + 6,
    borderRadius: SIZES.borderRadius + 4,
    alignItems: "center",
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
    shadowOpacity: 0.1,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: SIZES.lg + 2,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
