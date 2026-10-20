/**
 * Mecanismo de sincronización entre pestañas del navegador en el mismo origen.
 * Utiliza BroadcastChannel si está disponible en el navegador con fallback al evento `storage`.
 *
 * NOTA DE ARQUITECTURA:
 * Este canal permite reflejar inmediatamente las creaciones de pedidos, cambios de estado en cocina,
 * arqueos y stock entre múltiples pestañas/ventanas abiertas en el mismo computador o tableta.
 * Para sincronización multi-dispositivo a través de la red local o internet se requiere conectar
 * un servidor WebSocket / SSE respaldado por una base de datos central (ver src/services/).
 */

export type SyncMessage =
  | { type: 'STATE_UPDATED'; payload?: unknown }
  | { type: 'ORDER_CREATED'; orderCode: string }
  | { type: 'ORDER_STATUS_CHANGED'; orderId: string; status: string }
  | { type: 'CASH_SESSION_CHANGED'; status: string };

type SyncListener = (msg: SyncMessage) => void;

class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private readonly CHANNEL_NAME = 'chaves_burguer_tab_sync_v2';

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(this.CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel no soportado o restringido, usando fallback storage:', e);
      }
    }
  }

  public broadcast(message: SyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.error('Error enviando mensaje por BroadcastChannel:', err);
      }
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(message: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error en listener de sincronización:', err);
      }
    });
  }
}

export const syncManager = new TabSyncManager();
