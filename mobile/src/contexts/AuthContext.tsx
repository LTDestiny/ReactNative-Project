import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  GoogleLoginRequest,
} from "../types";

import { API_ENDPOINTS } from "../constants/api";

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  loginWithGoogle: (data: GoogleLoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;

  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored user when app starts
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (storedUser && accessToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function to save session
  const saveSession = async (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => {
    await AsyncStorage.multiSet([
      ["accessToken", accessToken],
      ["refreshToken", refreshToken],
      ["user", JSON.stringify(user)],
    ]);
    setUser(user);
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      const { user, accessToken, refreshToken } = response.data;
      await saveSession(user, accessToken, refreshToken);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đăng nhập thất bại";
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async (data: GoogleLoginRequest) => {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.GOOGLE_LOGIN,
        data
      );

      const { user, accessToken, refreshToken } = response.data;
      await saveSession(user, accessToken, refreshToken);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Google login failed";
      throw new Error(msg);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.REGISTER,
        data
      );

      const { user, accessToken, refreshToken } = response.data;
      await saveSession(user, accessToken, refreshToken);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đăng ký thất bại";
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get<{ user: User }>(API_ENDPOINTS.PROFILE);

      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
