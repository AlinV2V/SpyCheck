export class P2PNetwork {
  constructor() {
    this.channel = null;
    this.roomCode = null;
    this.playerId = null;
    this.listeners = new Set();
    this.actionHandlers = new Map();
    this.isHost = false;
  }

  connect(roomCode, playerId, isHost = false) {
    this.disconnect();
    this.roomCode = roomCode;
    this.playerId = playerId;
    this.isHost = isHost;

    const channelName = `spycheck_room_${roomCode}`;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(channelName);
      this.channel.onmessage = (event) => this.handleIncomingMessage(event.data);
    }
  }

  handleIncomingMessage(data) {
    if (!data || typeof data !== 'object') return;
    const { type, senderId, payload, timestamp } = data;
    if (senderId === this.playerId) return;
    this.notifyListeners({ type, senderId, payload, timestamp });
    if (this.actionHandlers.has(type)) {
      this.actionHandlers.get(type).forEach(handler => handler(payload, senderId));
    }
  }

  broadcastState(roomState) {
    this.postMessage({ type: 'STATE_UPDATE', senderId: this.playerId, payload: roomState, timestamp: Date.now() });
  }

  sendAction(actionType, payload = {}) {
    this.postMessage({ type: actionType, senderId: this.playerId, payload, timestamp: Date.now() });
  }

  postMessage(message) {
    if (this.channel) {
      try { this.channel.postMessage(message); } catch {}
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  on(actionType, handler) {
    if (!this.actionHandlers.has(actionType)) this.actionHandlers.set(actionType, new Set());
    this.actionHandlers.get(actionType).add(handler);
    return () => { const h = this.actionHandlers.get(actionType); if (h) h.delete(handler); };
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => { try { listener(data); } catch {} });
  }

  disconnect() {
    if (this.channel) { this.channel.close(); this.channel = null; }
    this.roomCode = null;
    this.playerId = null;
    this.listeners.clear();
    this.actionHandlers.clear();
  }
}

export const p2pNetwork = new P2PNetwork();
