import React, { useRef } from "react";
import {
  Text,
  StyleSheet,
  Image,
  Animated,
  Pressable,
} from "react-native";
import type { Button } from "../../shared/entities";

interface Props {
  button: Button;
  onPress: (buttonId: string) => void;
}

export function DeckButton({ button, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  }

  return (
    <Pressable
      onPress={() => onPress(button.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: button.style.backgroundColor,
            borderRadius: button.style.borderRadius,
            transform: [{ scale }],
          },
        ]}
      >
        {button.iconUri ? (
          <Image source={{ uri: button.iconUri }} style={styles.icon} />
        ) : null}
        <Text
          style={[
            styles.label,
            { color: button.style.textColor, fontSize: button.style.fontSize },
          ]}
        >
          {button.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 6,
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  icon: { width: 32, height: 32, marginBottom: 6 },
  label: { textAlign: "center", fontWeight: "600" },
});
