import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";

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
import SettingsScreen from "../screens/SettingsScreen";
import ChatScreen from "../screens/ChatScreen";

import { Colors } from "../theme/theme";

// ICONS
import { Ionicons } from "@expo/vector-icons";

// TYPES
export type AppStackParamList = {
  Main: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  OrderDetail: { id: string };
  Addresses: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeTabParamList = {
  HomeTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Auth = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

// --------------------------------------------
// ICON CONFIG
// --------------------------------------------
const getTabIcon = (name: string, focused: boolean, color: string) => {
  const map: Record<string, any> = {
    HomeTab: focused ? "home" : "home-outline",
    CartTab: focused ? "cart" : "cart-outline",
    OrdersTab: focused ? "list" : "list-outline",
    ChatTab: focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline",
    ProfileTab: focused ? "person" : "person-outline",
  };

  return (
    <Ionicons
      name={map[name] || "ellipse-outline"}
      size={24}
      color={color}
    />
  );
};

// --------------------------------------------
// TABS COMPONENT
// --------------------------------------------
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          height: 58,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          backgroundColor: Colors.white,
        },
        tabBarIcon: ({ color, focused }) =>
          getTabIcon(route.name, focused, color),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Trang chủ" }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: "Giỏ hàng" }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ title: "Đơn hàng" }} />
      <Tab.Screen name="ChatTab" component={ChatScreen} options={{ title: "Hỗ trợ" }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Tài khoản" }} />
    </Tab.Navigator>
  );
}

// --------------------------------------------
// AUTH STACK
// --------------------------------------------
function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login" component={LoginScreen} />
      <Auth.Screen name="Register" component={RegisterScreen} />
    </Auth.Navigator>
  );
}

// --------------------------------------------
// APP STACK
// --------------------------------------------
function AppStack() {
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
        options={{
          title: "Chi tiết sản phẩm",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// --------------------------------------------
// MAIN EXPORT
// --------------------------------------------
const Navigation: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
};

export default Navigation;
