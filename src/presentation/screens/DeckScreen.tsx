import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store/useAppStore";
import { DeckButton } from "../components/DeckButton";

type Props = NativeStackScreenProps<RootStackParamList, "Deck">;

export function DeckScreen({ navigation }: Props) {
  const { workspace, activeProfileId, activePageId, pressButton, disconnect, switchProfile } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeProfile = workspace?.profiles.find((p) => p.id === activeProfileId);
  const activePage = activeProfile?.pages.find((p) => p.id === activePageId);
  const multipleProfiles = (workspace?.profiles.length ?? 0) > 1;

  function handleDisconnect() {
    disconnect();
    navigation.replace("Pairing");
  }

  function handleSelectProfile(profileId: string) {
    switchProfile(profileId);
    setDropdownOpen(false);
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
        {/* Profile selector — dropdown trigger */}
        {multipleProfiles ? (
          <TouchableOpacity style={styles.profileSelector} onPress={() => setDropdownOpen(true)}>
            <Text style={styles.headerTitle}>{activeProfile?.name}</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.headerTitle}>{activeProfile?.name}</Text>
        )}

        <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectBtn}>
          <Text style={styles.disconnectText}>Desconectar</Text>
        </TouchableOpacity>
      </View>

      {/* Button grid */}
      <FlatList
        data={activePage.buttons}
        keyExtractor={(b) => b.id}
        numColumns={activePage.columns}
        key={activePage.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <DeckButton
            button={item}
            columns={activePage.columns}
            onPress={(id) => pressButton(id, activePage.id, activeProfile!.id)}
          />
        )}
      />

      {/* Dropdown modal */}
      <Modal visible={dropdownOpen} transparent animationType="fade" onRequestClose={() => setDropdownOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setDropdownOpen(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Seleccionar perfil</Text>
            {workspace!.profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              return (
                <TouchableOpacity
                  key={profile.id}
                  style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                  onPress={() => handleSelectProfile(profile.id)}
                >
                  <Text style={[styles.dropdownItemText, isActive && styles.dropdownItemTextActive]}>
                    {profile.name}
                  </Text>
                  {isActive && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
  profileSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: { color: "#a78bfa", fontSize: 18, fontWeight: "700" },
  chevron: { color: "#a78bfa", fontSize: 14, marginTop: 2 },
  disconnectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#374151",
  },
  disconnectText: { color: "#9ca3af", fontSize: 13 },
  grid: { padding: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f0f1a" },
  emptyText: { color: "#6b7280", fontSize: 16 },

  // Dropdown
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-start",
    paddingTop: 70,
    paddingHorizontal: 16,
  },
  dropdown: {
    backgroundColor: "#1a1a2e",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2a3f",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownTitle: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#2a2a3f",
  },
  dropdownItemActive: {
    backgroundColor: "rgba(124,58,237,0.15)",
  },
  dropdownItemText: { color: "#e5e7eb", fontSize: 15, fontWeight: "600" },
  dropdownItemTextActive: { color: "#a78bfa" },
  checkmark: { color: "#7c3aed", fontSize: 16, fontWeight: "700" },
});
