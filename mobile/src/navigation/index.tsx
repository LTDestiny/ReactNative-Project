import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../contexts/AuthContext";

// Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrdersScreen from "../screens/OrdersScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import AddressesScreen from "../screens/AddressesScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AdminProductsScreen from "../screens/AdminProductsScreen";
import AdminProductFormScreen from "../screens/AdminProductFormScreen";

import { COLORS } from "../constants/theme";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <View>
              <View style={{ backgroundColor: color, width: 24, height: 24 }} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: "Giỏ hàng",
          tabBarIcon: ({ color }) => (
            <View>
              <View style={{ backgroundColor: color, width: 24, height: 24 }} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color }) => (
            <View>
              <View style={{ backgroundColor: color, width: 24, height: 24 }} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => (
            <View>
              <View style={{ backgroundColor: color, width: 24, height: 24 }} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={AdminDashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <View>
              <View style={{ backgroundColor: color, width: 24, height: 24 }} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AdminProductsTab"
        component={AdminProductsScreen}
        options={{
          title: "Sản phẩm",
          tabBarIcon: ({ color }) => (
            <View>
              <View style={{ backgroundColor: color, width: 24, height: 24 }} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AdminOrdersTab"
        component={OrdersScreen}
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color }) => (
            <View>
              <View style={{ backgroundColor: color, width: 24, height: 24 }} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AdminProfileTab"
        component={ProfileScreen}
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => (
            <View>
              <View style={{ backgroundColor: color, width: 24, height: 24 }} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function CustomerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={HomeTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Chi tiết sản phẩm" }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function AdminStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminMain"
        component={AdminTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminProductForm"
        component={AdminProductFormScreen}
        options={{ title: "Sản phẩm" }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        user?.role === "admin" ? (
          <AdminStackNavigator />
        ) : (
          <CustomerStack />
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
