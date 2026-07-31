import React, { useRef } from "react";
import {
  Text,
  StyleSheet,
  Image,
  Animated,
  Pressable,
  Dimensions,
  View,
} from "react-native";
import type { Button } from "../../shared/entities";

interface Props {
  button: Button;
  onPress: (buttonId: string) => void;
  columns: number;
}

const MARGIN = 2;

export function DeckButton({ button, onPress, columns }: Props) {
  const size = (Dimensions.get("window").width - (MARGIN * 2 * columns + 4)) / columns;
  const faceSize = size - 4;
  const br = Math.min(button.style.borderRadius, 10);

  const translateY = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 3, duration: 60, useNativeDriver: true }),
      Animated.timing(shadowAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function handlePressOut() {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 30, bounciness: 6 }),
      Animated.timing(shadowAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }

  return (
    <Pressable
      onPress={() => onPress(button.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ margin: MARGIN }}
    >
      {/* Outer shell — same as desktop: background #111118, border #2a2a3a */}
      <Animated.View
        style={[
          styles.shell,
          {
            width: size,
            height: size,
            borderRadius: br + 2,
            shadowOpacity: shadowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.7] }),
          },
        ]}
      >
        {/* Face — same gradient logic as desktop */}
        <Animated.View
          style={[
            styles.face,
            {
              width: faceSize,
              height: faceSize,
              borderRadius: br,
              backgroundColor: button.style.backgroundColor,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Gloss — top 40%, same as desktop */}
          <View style={[styles.gloss, { borderRadius: br }]} />

          {/* Icon — absolute, 85% size, top 7.5%, same as desktop */}
          {button.iconUri && (
            <Image
              source={{ uri: button.iconUri }}
              style={[styles.icon, { borderRadius: Math.max(br - 2, 0) }]}
            />
          )}

          {/* Press darkening overlay */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: br,
                backgroundColor: "#000",
                opacity: shadowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] }),
              },
            ]}
          />

          {/* Label — absolute bottom 8, same as desktop */}
          <Text
            numberOfLines={2}
            style={[styles.label, { color: button.style.textColor, fontSize: button.style.fontSize }]}
          >
            {button.label}
          </Text>

          {/* Sound/media badges — same as desktop */}
          {(button.soundUri || button.mediaUri) && (
            <Text style={styles.badge}>
              {button.soundUri ? "🔊" : ""}{button.mediaUri ? "🎬" : ""}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: "#111118",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 2,
    borderWidth: 1.5,
    borderColor: "#2a2a3a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 14,
  },
  face: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  gloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  icon: {
    position: "absolute",
    width: "85%",
    height: "85%",
    top: "7.5%",
    left: "7.5%",
    resizeMode: "cover",
  },
  label: {
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 14,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  badge: {
    position: "absolute",
    bottom: 2,
    right: 4,
    fontSize: 9,
    opacity: 0.8,
  },
});
