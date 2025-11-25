import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

import { Colors, Spacing, Radius } from "../theme/theme";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: logout },
    ]);
  };

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>

          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          {user?.role === "admin" && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>ADMIN</Text>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <MenuItem
            emoji="📦"
            title="Đơn hàng của tôi"
            subtitle="Xem lịch sử mua hàng"
            onPress={() =>
              navigation.navigate("Main", { screen: "OrdersTab" })
            }
          />

          <MenuItem
            emoji="📍"
            title="Địa chỉ giao hàng"
            subtitle="Quản lý địa chỉ của bạn"
            onPress={() => navigation.navigate("Addresses")}
          />

          <MenuItem
            emoji="⚙️"
            title="Cài đặt"
            subtitle="Tùy chỉnh tài khoản"
            onPress={() => navigation.navigate("Settings")}
          />

          {user?.role === "admin" && (
            <MenuItem
              emoji="👑"
              title="Quản trị viên"
              subtitle="Quản lý sản phẩm & đơn hàng"
              isAdmin
              onPress={() =>
                Alert.alert("ADMIN", "Tính năng đang được phát triển")
              }
            />
          )}

          <MenuItem
            emoji="🚪"
            title="Đăng xuất"
            subtitle="Thoát khỏi tài khoản"
            isLogout
            onPress={handleLogout}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Phiên bản 1.0.0</Text>
          <Text style={styles.footerText}>GETABEC © 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

type MenuItemProps = {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isLogout?: boolean;
  isAdmin?: boolean;
};

const MenuItem: React.FC<MenuItemProps> = ({
  emoji,
  title,
  subtitle,
  onPress,
  isLogout,
  isAdmin,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.menuItem,
        isLogout && styles.menuLogout,
        isAdmin && styles.menuAdmin,
      ]}
    >
      <Text style={styles.menuEmoji}>{emoji}</Text>

      <View style={styles.menuInfo}>
        <Text style={[styles.menuTitle, isLogout && { color: Colors.white }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.menuSubtitle,
            isLogout && { color: Colors.white + "AA" },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <Text style={[styles.menuArrow, isLogout && { color: Colors.white }]}>
        ›
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // HEADER
  header: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: Colors.white,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  roleBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: "#FFD700",
    borderRadius: Radius.sm,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },

  // MENU SECTION
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    elevation: 2,
  },
  menuEmoji: {
    fontSize: 26,
    marginRight: Spacing.md,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 28,
    color: "#AAA",
    paddingLeft: Spacing.sm,
  },

  // ADMIN ITEM
  menuAdmin: {
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: "#F2C94C",
  },

  // LOGOUT ITEM
  menuLogout: {
    backgroundColor: Colors.primary,
  },

  // FOOTER
  footer: {
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  footerText: {
    fontSize: 13,
    color: "#777",
  },
});
