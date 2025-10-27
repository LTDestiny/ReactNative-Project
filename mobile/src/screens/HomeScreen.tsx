import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { Product, Category, Brand } from '../types';
import { API_ENDPOINTS } from '../constants/api';
import { COLORS, SIZES } from '../constants/theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
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
      console.error('Load products error:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUrl = item.images[0]?.url || 'https://via.placeholder.com/150';
    const displayPrice = item.sale_price || item.price;
    const hasDiscount = !!item.sale_price;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail' as never, { productId: item.id } as never)}
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
              <Text style={styles.originalPrice}>{formatPrice(item.price)}</Text>
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cửa hàng cơ khí</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          </View>
        }
      />
    </View>
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
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: COLORS.light,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    fontSize: SIZES.md,
  },
  categoryList: {
    maxHeight: 60,
    backgroundColor: COLORS.white,
  },
  categoryListContent: {
    padding: SIZES.padding,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: SIZES.sm,
    color: COLORS.dark,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  productList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  brandName: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  stock: {
    fontSize: SIZES.xs,
    color: COLORS.success,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
  },
});
