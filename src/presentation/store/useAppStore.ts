import { create } from "zustand";
import type { Workspace } from "../../shared/entities";
import type { PairingPayload } from "../../shared/protocols/pairing";
import { MobileWsClient } from "../../infrastructure/websocket/MobileWsClient";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface AppStore {
  status: ConnectionStatus;
  workspace: Workspace | null;
  activePageId: string | null;
  buttonStates: Record<string, unknown>;
  client: MobileWsClient;
  token: string;
  connect(pairing: PairingPayload): void;
  disconnect(): void;
  pressButton(buttonId: string, pageId: string, profileId: string): void;
  setNavigate(fn: (screen: string) => void): void;
}

const client = new MobileWsClient();

client.onClose(() => {
  useAppStore.getState().disconnect();
  useAppStore.getState()._navigate?.("Pairing");
});

export const useAppStore = create<AppStore>((set, get) => {
  client.onMessage((msg) => {
    if (msg.type === "sync.workspace") {
      const { workspace } = msg;
      const defaultPageId =
        workspace.profiles.find((p) => p.id === workspace.activeProfileId)
          ?.defaultPageId ?? null;
      set({ workspace, activePageId: defaultPageId, status: "connected" });
    } else if (msg.type === "button.stateUpdate") {
      set((s) => ({
        buttonStates: { ...s.buttonStates, [msg.buttonId]: msg.value },
      }));
    } else if (msg.type === "page.navigate") {
      set({ activePageId: msg.pageId });
    }
  });

  return {
    status: "disconnected",
    workspace: null,
    activePageId: null,
    buttonStates: {},
    client,
    token: "",
    _navigate: undefined as ((screen: string) => void) | undefined,

    setNavigate(fn) {
      set({ _navigate: fn });
    },

    connect(pairing) {
      set({ status: "connecting", token: pairing.token });
      client.connect(pairing);
    },

    disconnect() {
      client.disconnect();
      set({ status: "disconnected", workspace: null, activePageId: null, token: "" });
    },

    pressButton(buttonId, pageId, profileId) {
      client.send({ type: "button.press", buttonId, pageId, profileId });
    },
  };
});
