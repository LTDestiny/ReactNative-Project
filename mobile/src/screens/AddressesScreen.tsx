import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import { Address } from "../types";

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

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    address_line: "",
    city: "",
    district: "",
    postal_code: "",
    phone: "",
    is_default: false,
  });
  const [saving, setSaving] = useState(false);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/addresses");
      if (response.data.success) {
        setAddresses(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      label: "",
      address_line: "",
      city: "",
      district: "",
      postal_code: "",
      phone: "",
      is_default: addresses.length === 0,
    });
    setModalVisible(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || "",
      address_line: address.address_line,
      city: address.city,
      district: address.district || "",
      postal_code: address.postal_code || "",
      phone: address.phone || "",
      is_default: address.is_default,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.address_line || !formData.city) {
      Alert.alert("Thông báo", "Vui lòng nhập địa chỉ và thành phố");
      return;
    }

    try {
      setSaving(true);
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}`, formData);
      } else {
        await api.post("/addresses", formData);
      }
      setModalVisible(false);
      loadAddresses();
      Alert.alert("Thành công", `Địa chỉ đã được ${editingAddress ? "cập nhật" : "thêm"}`);
    } catch (error: any) {
      console.error("Failed to save address:", error);
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể lưu địa chỉ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (address: Address) => {
    Alert.alert("Xác nhận", "Bạn muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/addresses/${address.id}`);
            loadAddresses();
            Alert.alert("Thành công", "Địa chỉ đã được xóa");
          } catch (error) {
            console.error("Failed to delete address:", error);
            Alert.alert("Lỗi", "Không thể xóa địa chỉ");
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await api.post(`/addresses/${address.id}/default`);
      loadAddresses();
    } catch (error) {
      console.error("Failed to set default:", error);
      Alert.alert("Lỗi", "Không thể đặt làm địa chỉ mặc định");
    }
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={[styles.addressCard, item.is_default && styles.defaultCard]}>
      {item.is_default && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Mặc định</Text>
        </View>
      )}
      {item.label && <Text style={styles.addressLabel}>{item.label}</Text>}
      <Text style={styles.addressText}>{item.address_line}</Text>
      <Text style={styles.addressText}>
        {[item.district, item.city, item.postal_code].filter(Boolean).join(", ")}
      </Text>
      {item.phone && <Text style={styles.addressPhone}>☎ {item.phone}</Text>}

      <View style={styles.addressActions}>
        {!item.is_default && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item)}
          >
            <Text style={styles.actionButtonText}>Đặt mặc định</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={[styles.actionButtonText, styles.deleteText]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
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
          <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>

        {addresses.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddress}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Add/Edit Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nhãn (VD: Nhà riêng, Văn phòng)"
                value={formData.label}
                onChangeText={(text) =>
                  setFormData({ ...formData, label: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Địa chỉ *"
                value={formData.address_line}
                onChangeText={(text) =>
                  setFormData({ ...formData, address_line: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Quận/Huyện"
                value={formData.district}
                onChangeText={(text) =>
                  setFormData({ ...formData, district: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Thành phố *"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Mã bưu điện"
                value={formData.postal_code}
                onChangeText={(text) =>
                  setFormData({ ...formData, postal_code: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  setFormData({ ...formData, is_default: !formData.is_default })
                }
              >
                <View style={styles.checkbox}>
                  {formData.is_default && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Đặt làm địa chỉ mặc định</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  addButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.borderRadius,
  },
  addButtonText: {
    color: COLORS.dark,
    fontSize: SIZES.md + 1,
    fontWeight: "bold",
  },
  list: {
    padding: SIZES.padding,
  },
  addressCard: {
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
  defaultCard: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFF8E1",
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius,
    marginBottom: 8,
  },
  defaultText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: "bold",
  },
  addressLabel: {
    fontSize: SIZES.md + 2,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 8,
  },
  addressText: {
    fontSize: SIZES.md,
    color: COLORS.dark,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: SIZES.md,
    color: COLORS.dark,
    fontWeight: "600",
    marginTop: 6,
  },
  addressActions: {
    flexDirection: "row",
    marginTop: SIZES.padding,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.sm + 1,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  deleteText: {
    color: COLORS.white,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.lg + 2,
    color: COLORS.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    width: "90%",
    maxHeight: "80%",
    borderRadius: SIZES.borderRadius + 4,
    padding: SIZES.padding + 4,
  },
  modalTitle: {
    fontSize: SIZES.xl + 2,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: SIZES.padding + 4,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding - 2,
    fontSize: SIZES.md + 1,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.padding + 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: SIZES.lg,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: SIZES.md + 1,
    color: COLORS.dark,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.light,
  },
  cancelButtonText: {
    color: COLORS.dark,
    fontSize: SIZES.md + 2,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md + 2,
    fontWeight: "bold",
  },
});
