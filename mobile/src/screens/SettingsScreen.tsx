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
import { Colors, Spacing, Radius } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ACCOUNT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>

          <MenuItem
            emoji="👤"
            title="Thông tin cá nhân"
            onPress={() => Alert.alert("Thông tin cá nhân", "Tính năng đang phát triển")}
          />

          <MenuItem
            emoji="🔒"
            title="Đổi mật khẩu"
            onPress={() => Alert.alert("Đổi mật khẩu", "Tính năng đang phát triển")}
          />
        </View>

        {/* NOTIFICATIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông báo</Text>

          <MenuSwitch
            emoji="🔔"
            title="Thông báo đẩy"
            value={notifications}
            onChange={setNotifications}
          />

          <MenuSwitch
            emoji="📧"
            title="Email khuyến mãi"
            value={emailUpdates}
            onChange={setEmailUpdates}
          />
        </View>

        {/* APPEARANCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giao diện</Text>

          <MenuSwitch
            emoji="🌙"
            title="Chế độ tối"
            value={darkMode}
            onChange={setDarkMode}
          />

          <MenuItem
            emoji="🌐"
            title="Ngôn ngữ"
            rightComponent={<Text style={styles.language}>Tiếng Việt</Text>}
            onPress={() => Alert.alert("Ngôn ngữ", "Hiện tại: Tiếng Việt")}
          />
        </View>

        {/* SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>

          <MenuItem
            emoji="❓"
            title="Trung tâm trợ giúp"
            onPress={() =>
              Alert.alert(
                "Trợ giúp",
                "Email: support@getabec.vn\nĐiện thoại: 1900-xxxx"
              )
            }
          />

          <MenuItem
            emoji="ℹ️"
            title="Về chúng tôi"
            onPress={() =>
              Alert.alert("Thông tin", "GETABEC Vietnam\nPhiên bản 1.0.0")
            }
          />

          <MenuItem
            emoji="📜"
            title="Điều khoản & Chính sách"
            onPress={() => Alert.alert("Điều khoản", "Tính năng đang phát triển")}
          />
        </View>

        {/* ACCOUNT INFO */}
        <View style={styles.accountBox}>
          <Text style={styles.accountText}>Email: {user?.email}</Text>
          <Text style={styles.accountText}>
            Vai trò: {user?.role === "admin" ? "Quản trị viên" : "Khách hàng"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

type MenuItemProps = {
  emoji: string;
  title: string;
  onPress: () => void;
  rightComponent?: React.ReactNode;
};

const MenuItem: React.FC<MenuItemProps> = ({
  emoji,
  title,
  onPress,
  rightComponent,
}) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.leftRow}>
        <Text style={styles.itemEmoji}>{emoji}</Text>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>

      {rightComponent || <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
};

type MenuSwitchProps = {
  emoji: string;
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const MenuSwitch: React.FC<MenuSwitchProps> = ({
  emoji,
  title,
  value,
  onChange,
}) => {
  return (
    <View style={styles.item}>
      <View style={styles.leftRow}>
        <Text style={styles.itemEmoji}>{emoji}</Text>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#DDD", true: Colors.primary }}
        thumbColor={value ? Colors.white : "#999"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
  },

  // HEADER
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: Colors.white,
    fontSize: 16,
    marginRight: Spacing.md,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
  },

  // SECTION
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    marginBottom: Spacing.md,
  },

  // MENU ITEMS
  item: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemEmoji: {
    fontSize: 22,
    marginRight: Spacing.md,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },

  arrow: {
    fontSize: 26,
    color: "#AAA",
  },

  language: {
    fontSize: 14,
    color: Colors.text,
    marginRight: Spacing.sm,
  },

  // ACCOUNT BOX
  accountBox: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    elevation: 2,
  },
  accountText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
});
