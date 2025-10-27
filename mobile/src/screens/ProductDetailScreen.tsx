import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import api from '../services/api';
import { Product } from '../types';
import { API_ENDPOINTS } from '../constants/api';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route }: any) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCT_BY_ID(productId));
      setProduct(response.data.product);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const images = product.images.length > 0 ? product.images : [{ url: 'https://via.placeholder.com/400' }];
  const displayPrice = product.sale_price || product.price;
  const hasDiscount = !!product.sale_price;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: images[selectedImageIndex].url }} style={styles.mainImage} />
        {images.length > 1 && (
          <ScrollView horizontal style={styles.thumbnailContainer}>
            {images.map((img, index) => (
              <TouchableOpacity key={index} onPress={() => setSelectedImageIndex(index)}>
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
            <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
          )}
        </View>

        {product.stock !== undefined && (
          <Text style={product.stock > 0 ? styles.inStock : styles.outOfStock}>
            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
          </Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{product.description || 'Chưa có mô tả'}</Text>
        </View>

        {product.avg_rating && product.avg_rating > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <Text style={styles.rating}>
              ⭐ {product.avg_rating.toFixed(1)} ({product.review_count} đánh giá)
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.addToCartButton, product.stock === 0 && styles.buttonDisabled]}
          disabled={product.stock === 0}
          onPress={() => Alert.alert('Thông báo', 'Tính năng giỏ hàng đang được phát triển')}
        >
          <Text style={styles.addToCartText}>
            {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    backgroundColor: COLORS.white,
  },
  mainImage: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  thumbnailContainer: {
    padding: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  content: {
    padding: SIZES.padding,
  },
  brand: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: SIZES.lg,
    color: COLORS.gray,
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  inStock: {
    fontSize: SIZES.md,
    color: COLORS.success,
    marginBottom: 20,
  },
  outOfStock: {
    fontSize: SIZES.md,
    color: COLORS.danger,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.secondary,
    lineHeight: 24,
  },
  rating: {
    fontSize: SIZES.md,
    color: COLORS.dark,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '600',
  },
});
