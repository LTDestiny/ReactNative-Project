import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { AdminDashboardData } from "../types";
import { API_ENDPOINTS } from "../constants/api";
import { COLORS, SIZES } from "../constants/theme";

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isAdmin = user?.role === "admin";

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.ADMIN_DASHBOARD);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboard();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.notAllowedTitle}>🚫 Không có quyền truy cập</Text>
          <Text style={styles.notAllowedSubtitle}>
            Chức năng này chỉ dành cho quản trị viên
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Text style={styles.title}>Bảng điều khiển</Text>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          data && (
            <>
              <View style={styles.cardsGrid}>
                {[
                  {
                    label: "Doanh thu",
                    value: `${data.summary.total_revenue.toLocaleString("vi-VN")}đ`,
                    icon: "💰",
                  },
                  {
                    label: "Đơn hàng",
                    value: data.summary.total_orders,
                    icon: "🧾",
                  },
                  {
                    label: "Khách hàng",
                    value: data.summary.total_users,
                    icon: "👥",
                  },
                  {
                    label: "Sản phẩm",
                    value: data.summary.total_products,
                    icon: "📦",
                  },
                  {
                    label: "Đơn hôm nay",
                    value: data.summary.today_orders,
                    icon: "⚡",
                  },
                ].map((item) => (
                  <View key={item.label} style={styles.card}>
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                    <Text style={styles.cardValue}>{item.value}</Text>
                    <Text style={styles.cardLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
                <View style={styles.statusGrid}>
                  {Object.entries(data.orders.status_breakdown).map(
                    ([status, count]) => (
                      <View key={status} style={styles.statusCard}>
                        <Text style={styles.statusValue}>{count}</Text>
                        <Text style={styles.statusLabel}>{status}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
                {data.orders.recent.map((order) => (
                  <View key={order.id} style={styles.listItem}>
                    <View>
                      <Text style={styles.listTitle}>
                        #{order.id.substring(0, 8).toUpperCase()}
                      </Text>
                      <Text style={styles.listSubtitle}>
                        {order.customer_name || "Khách hàng"}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.listAmount}>
                        {order.total_amount.toLocaleString("vi-VN")}đ
                      </Text>
                      <Text style={styles.listStatus}>{order.status}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sản phẩm sắp hết hàng</Text>
                {data.inventory.low_stock.length === 0 ? (
                  <Text style={styles.emptyText}>Tất cả sản phẩm đều còn hàng</Text>
                ) : (
                  data.inventory.low_stock.map((product) => (
                    <View key={product.id} style={styles.listItem}>
                      <Text style={styles.listTitle}>{product.name}</Text>
                      <Text style={styles.lowStockValue}>
                        {product.stock} cái
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )
        )}
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
    flex: 1,
    padding: SIZES.padding,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: SIZES.padding,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.md,
    color: COLORS.gray,
  },
  notAllowedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 8,
  },
  notAllowedSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    textAlign: "center",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
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
  cardIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  cardLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  section: {
    marginTop: SIZES.padding,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: "bold",
    marginBottom: SIZES.padding,
    color: COLORS.dark,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statusCard: {
    width: "48%",
    backgroundColor: COLORS.light,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.padding,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statusLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    textTransform: "capitalize",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  listTitle: {
    fontSize: SIZES.md + 1,
    fontWeight: "600",
    color: COLORS.dark,
  },
  listSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  listAmount: {
    fontSize: SIZES.md,
    fontWeight: "600",
    color: COLORS.dark,
  },
  listStatus: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    textTransform: "capitalize",
  },
  lowStockValue: {
    fontSize: SIZES.md,
    fontWeight: "600",
    color: COLORS.danger,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    textAlign: "center",
  },
});

