import React, { useEffect, useRef } from "react";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PairingScreen } from "../screens/PairingScreen";
import { DeckScreen } from "../screens/DeckScreen";
import type { RootStackParamList } from "./types";
import { useAppStore } from "../store/useAppStore";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const setNavigate = useAppStore((s) => s.setNavigate);

  useEffect(() => {
    setNavigate((screen) => navRef.current?.navigate(screen as never));
  }, [setNavigate]);

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator initialRouteName="Pairing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Pairing" component={PairingScreen} />
        <Stack.Screen name="Deck" component={DeckScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
