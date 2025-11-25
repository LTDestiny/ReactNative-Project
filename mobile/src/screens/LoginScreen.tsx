import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../contexts/AuthContext";
import { Colors, Spacing, Radius } from "../theme/theme";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();

  const extra = (Constants?.expoConfig as any)?.extra?.googleOAuth ?? {};
  const redirectUri = makeRedirectUri({
    scheme: (Constants?.expoConfig as any)?.scheme || "getabecapp",
  });

  const [request, , promptAsync] = Google.useAuthRequest({
    expoClientId: extra.expoClientId,
    androidClientId: extra.androidClientId,
    iosClientId: extra.iosClientId,
    webClientId: extra.webClientId,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    responseType: "id_token",
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await promptAsync();

      if (result.type === "success") {
        const idToken = (result.params as any)?.id_token;
        if (!idToken) {
          Alert.alert("Lỗi", "Không nhận được idToken từ Google");
        } else {
          await loginWithGoogle({ idToken });
        }
      }
    } catch (err: any) {
      Alert.alert("Google login lỗi", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Đăng Nhập</Text>
            <Text style={styles.subtitle}>Ứng dụng GETABEC</Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                editable={!isLoading}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Đăng Nhập</Text>
              )}
            </TouchableOpacity>

            {/* Google */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                (!request || isLoading) && styles.disabledButton,
              ]}
              onPress={handleGoogleLogin}
              disabled={isLoading || !request}
            >
              <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
            </TouchableOpacity>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}> Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

// ──────────────────────────────────────────
//                  STYLES
// ──────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1 },

  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: "center",
  },

  // HEADER
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: Colors.text,
  },

  // FORM
  form: { width: "100%" },
  inputContainer: { marginBottom: 20 },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },

  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: Radius.md,
    fontSize: 16,
    color: Colors.text,
  },

  // BUTTON
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // GOOGLE BUTTON
  googleButton: {
    backgroundColor: Colors.primaryDark,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  googleButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // FOOTER
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 15,
  },
  link: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
});
