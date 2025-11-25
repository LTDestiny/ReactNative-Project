import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/api";
import { Colors, Spacing, Radius } from "../theme/theme";
import { useNavigation } from "@react-navigation/native";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào! Tôi là trợ lý cơ khí thông minh 🤖. Bạn cần tìm sản phẩm gì hôm nay?",
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const listRef = useRef<FlatList>(null);
  const navigation = useNavigation<any>();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const quickChips = [
    "Máy khoan bê tông",
    "Khoan gỗ",
    "Khoan kim loại",
    "Dụng cụ cầm tay",
    "Ưu tiên Makita/Bosch",
    "Ngân sách dưới 2 triệu",
  ];

  React.useEffect(() => {
    const initSession = async () => {
      try {
        const res = await api.post(API_ENDPOINTS.AI_SESSION, {});
        setSessionId(res.data.sessionId);
      } catch {
        setSessionId(null);
      }
    };
    initSession();
  }, []);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const payload = {
        sessionId,
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      const res = await api.post(API_ENDPOINTS.AI_CHAT, payload);

      const reply: ChatMessage = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: res.data.reply,
      };

      setMessages((prev) => [...prev, reply]);
      setSuggestions(res.data?.suggestions || []);

      listRef.current?.scrollToEnd({ animated: true });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: "assistant",
          content: "⚠️ Xin lỗi, hệ thống đang bận. Bạn thử lại giúp tôi nhé!",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {!isUser && (
          <Image
            source={require("../../assets/logonho.png")}
            style={styles.aiAvatar}
          />
        )}

        <Text
          style={[
            styles.bubbleText,
            isUser ? styles.userText : styles.aiText,
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER – AI Assistant */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/logonho.png")}
          style={styles.headerAvatar}
        />
        <Text style={styles.headerTitle}>Trợ lý cơ khí</Text>
      </View>

      <View style={styles.container}>
        {/* QUICK SUGGESTIONS */}
        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
        >
          {quickChips.map((c) => (
            <TouchableOpacity
              key={c}
              style={styles.chip}
              onPress={() => setInput(c)}
            >
              <Text style={styles.chipText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView> */}

        {/* CHAT LIST */}
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* AI SUGGESTIONS */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionTitle}>🔧 Gợi ý sản phẩm phù hợp</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestions.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.suggestionCard}
                  onPress={() =>
                    navigation.navigate("ProductDetail", { productId: s.id })
                  }
                >
                  <Image
                    source={{ uri: s.image_url || "https://via.placeholder.com/100" }}
                    style={styles.suggestionImage}
                  />

                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionName} numberOfLines={2}>
                      {s.name}
                    </Text>
                    <Text style={styles.suggestionBrand}>{s.brand_name}</Text>

                    <TouchableOpacity
                      style={styles.addToCart}
                      onPress={() =>
                        api.post("/cart/items", {
                          product_id: s.id,
                          quantity: 1,
                        })
                      }
                    >
                      <Text style={styles.addToCartText}>+ Thêm vào giỏ</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* INPUT ROW */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Gõ tin nhắn..."
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;

/* -------------------------------------------------- */
/*                     STYLES                         */
/* -------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A73E8",
  },

  /* MAIN */
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  listContent: {
    padding: 18,
    paddingBottom: 130,
  },

  /* BUBBLES */
  bubble: {
    maxWidth: "82%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#1A73E8",
    borderBottomRightRadius: 6,
  },

  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },

  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 4,
  },

  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  aiText: {
    color: "#333",
  },

  /* QUICK CHIPS */
  chipsRow: {
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  chip: {
    backgroundColor: "#E6F0FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#C5D7FF",
  },
  chipText: {
    color: "#1A73E8",
    fontWeight: "600",
  },

  /* SUGGESTIONS */
  suggestionSection: {
    paddingLeft: 16,
    marginBottom: 12,
    paddingTop: 6,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  suggestionCard: {
    width: 160,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginRight: 14,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  suggestionImage: {
    height: 110,
    width: "100%",
    backgroundColor: "#EEE",
  },
  suggestionInfo: {
    padding: 10,
  },
  suggestionName: {
    fontWeight: "700",
    fontSize: 14,
    color: "#111",
    marginBottom: 2,
  },
  suggestionBrand: {
    fontSize: 12,
    color: "#666",
  },
  addToCart: {
    marginTop: 8,
    backgroundColor: "#1A73E8",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  /* INPUT BAR – FLOATING STYLE */
  inputRow: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F3F6",
    paddingVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#1A73E8",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

