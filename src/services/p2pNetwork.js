import {
  initAsHost,
  joinAsGuest,
  announceJoin,
  onPlayersChanged,
  onGameStart,
  launchGame as launchGamePeer,
  disconnect as peerDisconnect
} from './firebase';

export class P2PNetwork {
  constructor() {
    this.roomCode = null;
    this.playerId = null;
    this.isHost = false;
    this.listeners = new Set();
    this.actionHandlers = new Map();
  }

  async connect(roomCode, playerId, isHost = false, playerData = {}) {
    this.disconnect();
    this.isHost = isHost;

    if (isHost) {
      const result = await initAsHost(
        playerData.name || 'Host',
        playerData.avatar || '/avatars/cat.jpg',
        playerData.color || '#3b82f6'
      );
      this.roomCode = result.roomCode;
      this.playerId = result.playerId;

      onPlayersChanged((players) => {
        this.notifyListeners({
          type: 'STATE_UPDATE',
          senderId: this.playerId,
          payload: { roomPlayers: players },
          timestamp: Date.now()
        });
      });

      onGameStart((config) => {
        this.notifyListeners({
          type: 'GAME_START',
          senderId: 'host',
          payload: config,
          timestamp: Date.now()
        });
      });

      this.notifyListeners({
        type: 'STATE_UPDATE',
        senderId: this.playerId,
        payload: { roomPlayers: result.players },
        timestamp: Date.now()
      });
    }
  }

  async joinAsGuest(roomCode, playerData = {}) {
    this.disconnect();
    this.isHost = false;

    const result = await joinAsGuest(
      roomCode,
      playerData.name || 'Operator',
      playerData.avatar || '/avatars/cat.jpg',
      playerData.color || '#3b82f6'
    );

    this.roomCode = roomCode;
    this.playerId = result.playerId;

    announceJoin(
      playerData.name || 'Operator',
      playerData.avatar || '/avatars/cat.jpg',
      playerData.color || '#3b82f6'
    );

    onPlayersChanged((players) => {
      this.notifyListeners({
        type: 'STATE_UPDATE',
        senderId: this.playerId,
        payload: { roomPlayers: players },
        timestamp: Date.now()
      });
    });

    onGameStart((config) => {
      this.notifyListeners({
        type: 'GAME_START',
        senderId: 'host',
        payload: config,
        timestamp: Date.now()
      });
    });
  }

  broadcastState(roomState) {
    this.notifyListeners({
      type: 'STATE_UPDATE',
      senderId: this.playerId,
      payload: roomState,
      timestamp: Date.now()
    });
  }

  async sendAction(actionType, payload = {}) {
    if (actionType === 'GAME_START' && this.isHost) {
      launchGamePeer(payload);
    }
    this.notifyListeners({
      type: actionType,
      senderId: this.playerId,
      payload,
      timestamp: Date.now()
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  on(actionType, handler) {
    if (!this.actionHandlers.has(actionType)) {
      this.actionHandlers.set(actionType, new Set());
    }
    this.actionHandlers.get(actionType).add(handler);
    return () => {
      const handlers = this.actionHandlers.get(actionType);
      if (handlers) handlers.delete(handler);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try { listener(data); } catch (err) {
        console.error('Error in network event listener:', err);
      }
    });
  }

  disconnect() {
    peerDisconnect();
    this.roomCode = null;
    this.playerId = null;
    this.isHost = false;
    this.listeners.clear();
    this.actionHandlers.clear();
  }
}

export const p2pNetwork = new P2PNetwork();
