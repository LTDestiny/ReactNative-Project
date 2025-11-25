import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { COLORS, SIZES } from "../constants/theme";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleLogoutConfirm = async () => {
    try {
      console.log("🚪 Logging out...");
      await logout();
      console.log("✅ Logout completed");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogout = () => {
    console.log("🔘 Logout button pressed");
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Bạn có chắc muốn đăng xuất?");
      if (confirmed) {
        handleLogoutConfirm();
      }
      return;
    }

    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: handleLogoutConfirm,
      },
    ]);
  };

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
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.full_name || "User"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.role === "admin" && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ADMIN</Text>
            </View>
          )}
        </View>

        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => (navigation.navigate as any)("Main", { screen: "OrdersTab" })}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>📦</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Đơn hàng của tôi</Text>
              <Text style={styles.menuSubtext}>Xem lịch sử mua hàng</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => (navigation.navigate as any)("Addresses")}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>📍</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Địa chỉ giao hàng</Text>
              <Text style={styles.menuSubtext}>Quản lý địa chỉ của bạn</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              (navigation.navigate as any)("Settings")
            }
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>⚙️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Cài đặt</Text>
              <Text style={styles.menuSubtext}>Tùy chỉnh tài khoản</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          {user?.role === "admin" && (
            <TouchableOpacity
              style={[styles.menuItem, styles.adminMenuItem]}
              onPress={() =>
                (navigation.navigate as any)("AdminDashboard")
              }
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuEmoji}>👑</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuText, styles.adminText]}>
                  Quản trị viên
                </Text>
                <Text style={styles.menuSubtext}>Thống kê & quản trị</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutButton]}
            onPress={handleLogout}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>🚪</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.logoutText}>Đăng xuất</Text>
              <Text style={styles.menuSubtext}>Thoát khỏi tài khoản</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Phiên bản 1.0.0</Text>
          <Text style={styles.footerText}>Cửa hàng cơ khí © 2025</Text>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: 44,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 4,
    borderColor: COLORS.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  email: {
    fontSize: SIZES.md + 1,
    color: COLORS.light,
    fontWeight: "500",
  },
  badge: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: SIZES.xs + 2,
    fontWeight: "bold",
    color: COLORS.dark,
    letterSpacing: 1,
  },
  menu: {
    marginTop: 24,
    paddingHorizontal: SIZES.padding + 4,
    paddingBottom: 100,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SIZES.padding + 6,
    borderRadius: SIZES.borderRadius + 4,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.light,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.padding,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: SIZES.md + 2,
    color: COLORS.dark,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  menuArrow: {
    fontSize: 28,
    color: COLORS.gray,
    fontWeight: "300",
  },
  adminMenuItem: {
    borderColor: COLORS.accent,
    backgroundColor: "#FFF8E1",
  },
  adminText: {
    color: COLORS.primary,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    marginTop: 24,
    borderColor: COLORS.danger,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutText: {
    fontSize: SIZES.md + 2,
    color: COLORS.white,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: SIZES.sm + 1,
    color: COLORS.gray,
    fontWeight: "500",
    marginVertical: 2,
  },
});
