import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import api from "../services/api";
import { Product } from "../types";
import { API_ENDPOINTS } from "../constants/api";
import { Colors, Spacing, Radius } from "../theme/theme";
import { AppStackParamList } from "../navigation";

const { width } = Dimensions.get("window");

type Props = NativeStackScreenProps<AppStackParamList, "ProductDetail">;

type Recommendation = {
  id: string;
  name: string;
  brand_name?: string;
  image_url?: string;
};

const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;


  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [recs, setRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    loadProduct();
    loadRecs();
  }, [productId]);

  // Gợi ý sản phẩm liên quan (AI)
  const loadRecs = async () => {
    try {
      const res = await api.get(
        `${API_ENDPOINTS.AI_RECOMMENDATIONS}?productId=${productId}`
      );
      if (res.data?.success) {
        setRecs(res.data.data);
      }
    } catch {
      // silent
    }
  };

  const loadProduct = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCT_BY_ID(productId));
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

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
          onPress: () =>
            (navigation as any).navigate("Main", { screen: "CartTab" }),
        },
      ]);
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể thêm vào giỏ hàng"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // ──────────────────────────────────────────
  // LOADING / EMPTY
  // ──────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
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

  // ──────────────────────────────────────────
  // MAIN RENDER
  // ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ẢNH SẢN PHẨM */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: images[selectedImageIndex].url }}
            style={styles.mainImage}
          />

          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailRow}
            >
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

        {/* THÔNG TIN SẢN PHẨM */}
        <View style={styles.contentCard}>
          <Text style={styles.brand}>{product.brand_name}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
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
              {product.stock > 0
                ? `Còn ${product.stock} sản phẩm`
                : "Hết hàng"}
            </Text>
          )}
        </View>

        {/* MÔ TẢ */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>
            {product.description || "Chưa có mô tả"}
          </Text>
        </View>

        {/* ĐÁNH GIÁ */}
        {product.avg_rating && product.avg_rating > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <Text style={styles.rating}>
              ⭐ {product.avg_rating.toFixed(1)} ({product.review_count} đánh
              giá)
            </Text>
          </View>
        )}

        {/* BUTTON THÊM GIỎ HÀNG */}
        <View style={styles.bottomSpacing}>
          <TouchableOpacity
            style={[
              styles.addButton,
              (product.stock === 0 || addingToCart) && styles.addButtonDisabled,
            ]}
            disabled={product.stock === 0 || addingToCart}
            onPress={handleAddToCart}
          >
            {addingToCart ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.addButtonText}>
                {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* GỢI Ý LIÊN QUAN */}
        {recs.length > 0 && (
          <View style={styles.recsContainer}>
            <Text style={styles.recsTitle}>Gợi ý liên quan</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recsRow}
            >
              {recs.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.recCard}
                  onPress={() =>
                    navigation.navigate("ProductDetail", { id: r.id })
                  }
                >
                  <View style={styles.recImage} />
                  <View style={styles.recInfo}>
                    <Text style={styles.recName} numberOfLines={2}>
                      {r.name}
                    </Text>
                    {!!r.brand_name && (
                      <Text style={styles.recBrand}>{r.brand_name}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text,
  },

  // IMAGE
  imageWrapper: {
    backgroundColor: Colors.white,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  mainImage: {
    width,
    height: width,
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
  thumbnailRow: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: Radius.sm,
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },

  // CONTENT CARD
  contentCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    elevation: 3,
  },
  brand: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },
  originalPrice: {
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  inStock: {
    marginTop: Spacing.sm,
    fontSize: 14,
    color: "#0A8754",
    fontWeight: "600",
  },
  outOfStock: {
    marginTop: Spacing.sm,
    fontSize: 14,
    color: "#C0392B",
    fontWeight: "600",
  },

  // SECTION CARD
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  rating: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "600",
  },

  bottomSpacing: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#B3B3B3",
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // RECOMMENDATIONS
  recsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg + Spacing.sm,
  },
  recsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  recsRow: {
    paddingTop: Spacing.sm,
  },
  recCard: {
    width: 160,
    marginRight: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    elevation: 2,
  },
  recImage: {
    height: 100,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    backgroundColor: "#f0f0f0",
  },
  recInfo: {
    padding: Spacing.sm,
  },
  recName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  recBrand: {
    fontSize: 12,
    color: "#777",
  },
});
