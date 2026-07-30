import type {
  WsEnvelope,
  MobileToDesktopEvent,
  DesktopToMobileMessage,
} from "../../shared/events";
import type { PairingPayload } from "../../shared/protocols/pairing";

type MessageHandler = (msg: DesktopToMobileMessage) => void;
type CloseHandler = () => void;

export class MobileWsClient {
  private ws: WebSocket | null = null;
  private handlers: MessageHandler[] = [];
  private closeHandlers: CloseHandler[] = [];
  private currentToken = "";

  connect(pairing: PairingPayload): void {
    this.currentToken = pairing.token;
    this.ws = new WebSocket(`ws://${pairing.host}:${pairing.port}`);

    this.ws.onopen = () => {
      this.send({ type: "client.ready" });
    };

    this.ws.onmessage = (event) => {
      try {
        const envelope = JSON.parse(
          event.data as string
        ) as WsEnvelope<DesktopToMobileMessage>;
        this.handlers.forEach((h) => h(envelope.payload));
      } catch {
        // malformed message — ignore
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.closeHandlers.forEach((h) => h());
    };
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  send(event: MobileToDesktopEvent): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const envelope: WsEnvelope<MobileToDesktopEvent> = {
      token: this.currentToken,
      payload: event,
    };
    this.ws.send(JSON.stringify(envelope));
  }

  onClose(handler: CloseHandler): void {
    this.closeHandlers.push(handler);
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
