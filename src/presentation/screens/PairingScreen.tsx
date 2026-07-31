import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  BackHandler,
} from "react-native";
import { Camera, CameraType } from "react-native-camera-kit";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store/useAppStore";
import type { PairingPayload } from "../../shared/protocols/pairing";

type Props = NativeStackScreenProps<RootStackParamList, "Pairing">;

export function PairingScreen({ navigation }: Props) {
  const { connect, status } = useAppStore();
  const [scanning, setScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const navigated = useRef(false);

  useEffect(() => {
    if (!scanning) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setScanning(false);
      setScanned(false);
      return true;
    });
    return () => sub.remove();
  }, [scanning]);

  useEffect(() => {
    if (status !== "connected" || navigated.current) return;
    navigated.current = true;
    navigation.replace("Deck");
  }, [status]);

  async function handleSyncPress() {
    if (Platform.OS === "android") {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permiso requerido", "Se necesita acceso a la cámara para escanear el QR.");
        return;
      }
      setHasPermission(true);
    } else {
      setHasPermission(true);
    }
    setScanned(false);
    setScanning(true);
  }

  function handleQrRead(event: { nativeEvent: { codeStringValue: string } }) {
    if (scanned) return;
    const raw = event.nativeEvent.codeStringValue;
    try {
      const pairing = JSON.parse(raw) as PairingPayload;
      setScanned(true);
      connect(pairing);
    } catch {
      Alert.alert("QR inválido", "El código escaneado no es válido.", [
        { text: "Reintentar", onPress: () => setScanned(false) },
      ]);
    }
  }

  if (!scanning) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎛 Creator Deck</Text>
        <Text style={styles.subtitle}>Conecta con la app de escritorio escaneando el QR</Text>
        <TouchableOpacity style={styles.button} onPress={handleSyncPress}>
          <Text style={styles.buttonText}>Sincronizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎛 Creator Deck</Text>
        <Text style={styles.subtitle}>Se necesita permiso de cámara</Text>
        <TouchableOpacity style={styles.button} onPress={handleSyncPress}>
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎛 Creator Deck</Text>
      <Text style={styles.subtitle}>Apunta al QR que muestra la app de escritorio</Text>

      <View style={styles.scannerWrapper}>
        <Camera
          style={styles.scanner}
          cameraType={CameraType.Back}
          scanBarcode
          onReadCode={handleQrRead}
          showFrame
          laserColor="#7c3aed"
          frameColor="#7c3aed"
        />
      </View>

      {scanned && <Text style={styles.hint}>Conectando…</Text>}

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => { setScanning(false); setScanned(false); }}
      >
        <Text style={styles.closeBtnText}>✕  Cancelar escaneo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0f0f1a",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#a78bfa",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  scannerWrapper: {
    width: 280,
    height: 280,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#7c3aed",
  },
  closeBtn: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "#374151",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  closeBtnText: {
    color: "#9ca3af",
    fontSize: 15,
    fontWeight: "600",
  },
  scanner: {
    width: "100%",
    height: "100%",
  },
  hint: {
    marginTop: 16,
    color: "#a78bfa",
    fontSize: 14,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#7c3aed",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
