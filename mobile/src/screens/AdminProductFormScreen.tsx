import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../services/api";
import { Product } from "../types";
import { COLORS, SIZES } from "../constants/theme";

type RouteParams = {
  product?: Product;
};

export default function AdminProductFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params as RouteParams;

  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [salePrice, setSalePrice] = useState(
    product?.sale_price ? String(product.sale_price) : ""
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name || !price) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên và giá sản phẩm");
      return;
    }

    const payload = {
      name,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : undefined,
      description,
      sku: sku || undefined,
    };

    try {
      setSaving(true);
      if (product) {
        await api.put(`/products/${product.id}`, payload);
        Alert.alert("Thành công", "Đã cập nhật sản phẩm");
      } else {
        await api.post("/products", payload);
        Alert.alert("Thành công", "Đã tạo sản phẩm mới");
      }
      navigation.goBack();
    } catch (error: any) {
      console.error("Save product error:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể lưu sản phẩm"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {product ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        </Text>

        <Text style={styles.label}>Tên sản phẩm</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên sản phẩm"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>SKU (mã sản phẩm)</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: SKU-001"
          value={sku}
          onChangeText={setSku}
        />

        <Text style={styles.label}>Giá bán</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 1500000"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Giá khuyến mãi</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 1200000"
          value={salePrice}
          onChangeText={setSalePrice}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Thông tin sản phẩm"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Đang lưu..." : product ? "Cập nhật" : "Tạo sản phẩm"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SIZES.padding + 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 24,
  },
  label: {
    fontSize: SIZES.md,
    color: COLORS.dark,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: 14,
    marginBottom: 16,
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md + 1,
    fontWeight: "bold",
  },
});

