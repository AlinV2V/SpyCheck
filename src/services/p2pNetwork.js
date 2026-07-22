import { createRoom, joinRoom, onRoomPlayersChanged, onGameStart, launchGame, leaveRoom } from './firebase';

export class P2PNetwork {
  constructor() {
    this.roomCode = null;
    this.playerId = null;
    this.isHost = false;
    this.listeners = new Set();
    this.actionHandlers = new Map();
    this._unsubPlayers = null;
    this._unsubGame = null;
    this._myPlayerData = null;
  }

  async connect(roomCode, playerId, isHost = false, playerData = {}) {
    this.disconnect();

    this.roomCode = roomCode;
    this.playerId = playerId;
    this.isHost = isHost;
    this._myPlayerData = playerData;

    if (isHost) {
      const result = await createRoom({
        name: playerData.name || 'Host',
        avatar: playerData.avatar || '/avatars/cat.jpg',
        color: playerData.color || '#3b82f6',
      });
      this.roomCode = result.roomCode;
      this.playerId = result.playerId;
    }

    this._unsubPlayers = onRoomPlayersChanged(this.roomCode, (players) => {
      this.notifyListeners({
        type: 'STATE_UPDATE',
        senderId: this.playerId,
        payload: { roomPlayers: players },
        timestamp: Date.now()
      });
    });

    this._unsubGame = onGameStart(this.roomCode, (config) => {
      this.notifyListeners({
        type: 'GAME_START',
        senderId: 'host',
        payload: config,
        timestamp: Date.now()
      });
    });
  }

  async joinAsGuest(roomCode, playerData = {}) {
    this.disconnect();
    this.roomCode = roomCode;
    this.isHost = false;
    this._myPlayerData = playerData;

    const result = await joinRoom(roomCode, {
      name: playerData.name || 'Operator',
      avatar: playerData.avatar || '/avatars/cat.jpg',
      color: playerData.color || '#3b82f6',
    });

    this.playerId = result.playerId;

    this._unsubPlayers = onRoomPlayersChanged(this.roomCode, (players) => {
      this.notifyListeners({
        type: 'STATE_UPDATE',
        senderId: this.playerId,
        payload: { roomPlayers: players },
        timestamp: Date.now()
      });
    });

    this._unsubGame = onGameStart(this.roomCode, (config) => {
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
      await launchGame(this.roomCode, payload);
    }
    this.notifyListeners({
      type: actionType,
      senderId: this.playerId,
      payload,
      timestamp: Date.now()
    });
  }

  postMessage(message) {
    this.notifyListeners(message);
    if (this.actionHandlers.has(message.type)) {
      const handlers = this.actionHandlers.get(message.type);
      handlers.forEach(handler => handler(message.payload, message.senderId));
    }
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
    if (this._unsubPlayers) { this._unsubPlayers(); this._unsubPlayers = null; }
    if (this._unsubGame) { this._unsubGame(); this._unsubGame = null; }
    if (this.roomCode && this.playerId) {
      leaveRoom(this.roomCode, this.playerId);
    }
    this.roomCode = null;
    this.playerId = null;
    this.isHost = false;
    this.listeners.clear();
    this.actionHandlers.clear();
  }
}

export const p2pNetwork = new P2PNetwork();
