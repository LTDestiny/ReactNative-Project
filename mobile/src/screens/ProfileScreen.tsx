import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.full_name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.role === 'admin' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ADMIN</Text>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang được phát triển')}
        >
          <Text style={styles.menuText}>📦 Đơn hàng của tôi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang được phát triển')}
        >
          <Text style={styles.menuText}>📍 Địa chỉ giao hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang được phát triển')}
        >
          <Text style={styles.menuText}>⚙️ Cài đặt</Text>
        </TouchableOpacity>

        {user?.role === 'admin' && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Thông báo', 'Tính năng quản trị đang được phát triển')}
          >
            <Text style={styles.menuText}>👨‍💼 Quản trị</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
        <Text style={styles.footerText}>Mechanical Marketplace © 2024</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  email: {
    fontSize: SIZES.md,
    color: COLORS.gray,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: COLORS.warning,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  menu: {
    marginTop: 20,
    paddingHorizontal: SIZES.padding,
  },
  menuItem: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    marginBottom: 12,
  },
  menuText: {
    fontSize: SIZES.md,
    color: COLORS.dark,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    marginTop: 20,
  },
  logoutText: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
});
