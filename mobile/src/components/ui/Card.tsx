// src/components/ui/Card.tsx
import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors, Spacing, Radius } from "../../theme/theme";

interface Props {
  children: ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<Props> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    elevation: 2,
  },
});
