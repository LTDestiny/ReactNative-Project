import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { COLORS, SIZES } from "../constants/theme";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài đặt</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Alert.alert("Thông tin cá nhân", "Tính năng đang phát triển")
              }
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>👤</Text>
                <Text style={styles.settingText}>Thông tin cá nhân</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Alert.alert("Đổi mật khẩu", "Tính năng đang phát triển")
              }
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔒</Text>
                <Text style={styles.settingText}>Đổi mật khẩu</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>THÔNG BÁO</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔔</Text>
                <Text style={styles.settingText}>Thông báo đẩy</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: COLORS.light, true: COLORS.accent }}
                thumbColor={notifications ? COLORS.primary : COLORS.gray}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📧</Text>
                <Text style={styles.settingText}>Email khuyến mãi</Text>
              </View>
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: COLORS.light, true: COLORS.accent }}
                thumbColor={emailUpdates ? COLORS.primary : COLORS.gray}
              />
            </View>
          </View>

          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GIAO DIỆN</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🌙</Text>
                <Text style={styles.settingText}>Chế độ tối</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.light, true: COLORS.accent }}
                thumbColor={darkMode ? COLORS.primary : COLORS.gray}
              />
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Alert.alert("Ngôn ngữ", "Hiện tại: Tiếng Việt")
              }
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🌐</Text>
                <Text style={styles.settingText}>Ngôn ngữ</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>Tiếng Việt</Text>
                <Text style={styles.settingArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HỖ TRỢ</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Alert.alert("Trợ giúp", "Email: support@cuahangcokhí.vn\nĐiện thoại: 1900-xxxx")
              }
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>❓</Text>
                <Text style={styles.settingText}>Trung tâm trợ giúp</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Alert.alert("Về chúng tôi", "Cửa hàng cơ khí\nPhiên bản 1.0.0")
              }
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>ℹ️</Text>
                <Text style={styles.settingText}>Về chúng tôi</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Alert.alert("Điều khoản", "Tính năng đang phát triển")
              }
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📜</Text>
                <Text style={styles.settingText}>Điều khoản & Chính sách</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Account Info */}
          <View style={styles.accountInfo}>
            <Text style={styles.accountInfoText}>Tài khoản: {user?.email}</Text>
            <Text style={styles.accountInfoText}>Loại: {user?.role === "admin" ? "Quản trị viên" : "Khách hàng"}</Text>
          </View>
        </ScrollView>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding + 4,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: SIZES.borderRadius + 8,
    borderBottomRightRadius: SIZES.borderRadius + 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  backButton: {
    fontSize: SIZES.lg,
    color: COLORS.white,
    fontWeight: "600",
    marginRight: SIZES.padding,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: SIZES.padding + 4,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    fontWeight: "bold",
    color: COLORS.gray,
    marginBottom: SIZES.padding,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: SIZES.padding + 4,
    borderRadius: SIZES.borderRadius,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: SIZES.padding,
  },
  settingText: {
    fontSize: SIZES.md + 1,
    color: COLORS.dark,
    fontWeight: "600",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginRight: 8,
  },
  settingArrow: {
    fontSize: 24,
    color: COLORS.gray,
    fontWeight: "300",
  },
  accountInfo: {
    margin: SIZES.padding,
    padding: SIZES.padding + 4,
    backgroundColor: COLORS.light,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountInfoText: {
    fontSize: SIZES.sm + 1,
    color: COLORS.gray,
    marginVertical: 2,
  },
});
