/**
 * P2P Local Broadcast Network Layer using BroadcastChannel API.
 * Enables seamless multi-tab/multi-window local synchronization for SpyCheck.
 */

export class P2PNetwork {
  constructor() {
    this.channel = null;
    this.roomCode = null;
    this.playerId = null;
    this.listeners = new Set();
    this.actionHandlers = new Map();
    this.isHost = false;
  }

  /**
   * Connect to a specific room channel
   * @param {string} roomCode - The room code identifier
   * @param {string} playerId - The player's unique identifier
   * @param {boolean} isHost - Whether this player instance is host
   */
  connect(roomCode, playerId, isHost = false) {
    if (this.channel) {
      this.disconnect();
    }

    this.roomCode = roomCode;
    this.playerId = playerId;
    this.isHost = isHost;

    const channelName = `spycheck_room_${roomCode}`;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(channelName);
      this.channel.onmessage = (event) => this.handleIncomingMessage(event.data);
    } else {
      console.warn('BroadcastChannel API not supported in this environment.');
    }

    // Broadcast join event across tabs
    this.sendAction('PLAYER_JOINED', { playerId, isHost });
  }

  /**
   * Handle incoming network messages from BroadcastChannel
   */
  handleIncomingMessage(data) {
    if (!data || typeof data !== 'object') return;

    const { type, senderId, payload, timestamp } = data;

    // Trigger general event listeners
    this.notifyListeners({ type, senderId, payload, timestamp });

    // Trigger specific action handlers
    if (this.actionHandlers.has(type)) {
      const handlers = this.actionHandlers.get(type);
      handlers.forEach(handler => handler(payload, senderId));
    }
  }

  /**
   * Broadcast current room state across network channel
   * @param {Object} roomState - The complete room state
   */
  broadcastState(roomState) {
    this.postMessage({
      type: 'STATE_UPDATE',
      senderId: this.playerId,
      payload: roomState,
      timestamp: Date.now()
    });
  }

  /**
   * Send a specific player action across the network
   * @param {string} actionType - Action type string (e.g. 'SUBMIT_ANSWER', 'CAST_VOTE')
   * @param {Object} payload - Action payload data
   */
  sendAction(actionType, payload = {}) {
    this.postMessage({
      type: actionType,
      senderId: this.playerId,
      payload: payload,
      timestamp: Date.now()
    });
  }

  /**
   * Low level message posting
   */
  postMessage(message) {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.error('Failed to post message on BroadcastChannel:', err);
      }
    }
  }

  /**
   * Subscribe to all network events
   * @param {Function} listener callback receiving { type, senderId, payload, timestamp }
   * @returns {Function} unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Register handler for a specific action type
   * @param {string} actionType
   * @param {Function} handler (payload, senderId) => void
   * @returns {Function} unsubscribe function
   */
  on(actionType, handler) {
    if (!this.actionHandlers.has(actionType)) {
      this.actionHandlers.set(actionType, new Set());
    }
    this.actionHandlers.get(actionType).add(handler);

    return () => {
      const handlers = this.actionHandlers.get(actionType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Notify generic subscribers
   */
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error('Error in network event listener:', err);
      }
    });
  }

  /**
   * Disconnect and clean up channel resources
   */
  disconnect() {
    if (this.channel) {
      this.sendAction('PLAYER_LEFT', { playerId: this.playerId });
      this.channel.close();
      this.channel = null;
    }
    this.roomCode = null;
    this.playerId = null;
    this.listeners.clear();
    this.actionHandlers.clear();
  }
}

// Singleton instance export alongside class
export const p2pNetwork = new P2PNetwork();
