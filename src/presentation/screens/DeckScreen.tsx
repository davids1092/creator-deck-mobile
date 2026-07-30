import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store/useAppStore";
import { DeckButton } from "../components/DeckButton";

type Props = NativeStackScreenProps<RootStackParamList, "Deck">;

export function DeckScreen({ navigation }: Props) {
  const { workspace, activePageId, pressButton, disconnect } = useAppStore();

  const activeProfile = workspace?.profiles.find(
    (p) => p.id === workspace.activeProfileId
  );
  const activePage = activeProfile?.pages.find((p) => p.id === activePageId);

  function handleDisconnect() {
    disconnect();
    navigation.replace("Pairing");
  }

  if (!activePage) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Cargando página…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{activePage.name}</Text>
        <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectBtn}>
          <Text style={styles.disconnectText}>Desconectar</Text>
        </TouchableOpacity>
      </View>

      {/* Button grid */}
      <FlatList
        data={activePage.buttons}
        keyExtractor={(b) => b.id}
        numColumns={activePage.columns}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <DeckButton
            button={item}
            onPress={(id) => pressButton(id, activePage.id, activeProfile!.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e2e",
  },
  headerTitle: { color: "#a78bfa", fontSize: 18, fontWeight: "700" },
  disconnectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#374151",
  },
  disconnectText: { color: "#9ca3af", fontSize: 13 },
  grid: { padding: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f0f1a" },
  emptyText: { color: "#6b7280", fontSize: 16 },
});
