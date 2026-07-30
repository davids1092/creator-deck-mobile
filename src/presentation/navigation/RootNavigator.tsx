import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PairingScreen } from "../screens/PairingScreen";
import { DeckScreen } from "../screens/DeckScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Pairing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Pairing" component={PairingScreen} />
        <Stack.Screen name="Deck" component={DeckScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
