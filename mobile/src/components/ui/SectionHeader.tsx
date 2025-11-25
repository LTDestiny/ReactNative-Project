// src/components/ui/SectionHeader.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing } from "../../theme/theme";

interface Props {
  label: string;
}

const SectionHeader: React.FC<Props> = ({ label }) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label.toUpperCase()}</Text>
  </View>
);

export default SectionHeader;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});
