import Peer from 'peerjs';

let peer = null;
let connections = {};
let roomCode = null;
let myPlayerId = null;
let playerData = null;
let onPlayersChangedCallback = null;
let onGameStartCallback = null;

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePeerId() {
  return 'spycheck-' + Math.random().toString(36).substring(2, 10);
}

function sendToAll(data) {
  Object.values(connections).forEach(conn => {
    if (conn.open) conn.send(data);
  });
}

export function initAsHost(playerName, avatar, color) {
  return new Promise((resolve, reject) => {
    const peerId = generatePeerId();
    roomCode = generateRoomCode();
    myPlayerId = 'host_' + Math.random().toString(36).substring(2, 6);
    playerData = { name: playerName, avatar, color };

    peer = new Peer(peerId);

    peer.on('open', () => {
      resolve({
        roomCode: peerId,
        playerId: myPlayerId,
        players: [{
          id: myPlayerId,
          name: playerName,
          avatar,
          color,
          isBot: false,
          isHost: true,
          isReady: true
        }]
      });
    });

    peer.on('connection', (conn) => {
      connections[conn.peer] = conn;

      conn.on('open', () => {
        const guestId = 'guest_' + Math.random().toString(36).substring(2, 6);
        conn.send({ type: 'WELCOME', playerId: guestId, hostData: playerData, roomPlayers: getAllPlayers() });
      });

      conn.on('data', (data) => {
        handleIncomingData(data, conn);
      });

      conn.on('close', () => {
        delete connections[conn.peer];
        if (conn._guestPlayerId) {
          delete connections._players?.[conn._guestPlayerId];
        }
        syncPlayers();
      });
    });

    peer.on('error', (err) => {
      reject(err);
    });

    connections._players = {};
    connections._myPeerId = peerId;
  });
}

export function joinAsGuest(hostPeerId, playerName, avatar, color) {
  return new Promise((resolve, reject) => {
    myPlayerId = 'guest_' + Math.random().toString(36).substring(2, 6);
    playerData = { name: playerName, avatar, color };

    peer = new Peer(generatePeerId());

    peer.on('open', () => {
      const conn = peer.connect(hostPeerId, { reliable: true });

      conn.on('open', () => {
        connections[hostPeerId] = conn;
        conn._guestPlayerId = myPlayerId;
      });

      conn.on('data', (data) => {
        if (data.type === 'WELCOME') {
          myPlayerId = data.playerId;
          playerData = data.hostData;
          const players = data.roomPlayers || [];
          if (onPlayersChangedCallback) onPlayersChangedCallback(players);
          resolve({ playerId: myPlayerId, roomCode: hostPeerId, players });
        } else {
          handleIncomingData(data, conn);
        }
      });

      conn.on('close', () => {
        delete connections[hostPeerId];
      });
    });

    peer.on('error', (err) => {
      reject(err);
    });
  });
}

function handleIncomingData(data, conn) {
  switch (data.type) {
    case 'JOIN_ANNOUNCE': {
      const newPlayer = {
        id: conn._guestPlayerId || data.playerId,
        name: data.playerName || 'Operator',
        avatar: data.playerAvatar || '/avatars/cat.jpg',
        color: data.playerColor || '#3b82f6',
        isBot: false,
        isHost: false,
        isReady: true
      };
      connections._players = connections._players || {};
      connections._players[newPlayer.id] = newPlayer;
      if (!conn._guestPlayerId) conn._guestPlayerId = newPlayer.id;
      sendToAll({ type: 'ROOM_STATE', players: getAllPlayers() });
      syncPlayers();
      break;
    }
    case 'ROOM_STATE': {
      if (data.players && onPlayersChangedCallback) {
        onPlayersChangedCallback(data.players);
      }
      break;
    }
    case 'GAME_START': {
      if (onGameStartCallback) onGameStartCallback(data.config);
      break;
    }
  }
}

function getAllPlayers() {
  const self = {
    id: myPlayerId,
    name: playerData?.name || 'Host',
    avatar: playerData?.avatar || '/avatars/cat.jpg',
    color: playerData?.color || '#3b82f6',
    isBot: false,
    isHost: true,
    isReady: true
  };
  const guests = connections._players ? Object.values(connections._players) : [];
  return [self, ...guests];
}

function syncPlayers() {
  const players = getAllPlayers();
  if (onPlayersChangedCallback) onPlayersChangedCallback(players);
  sendToAll({ type: 'ROOM_STATE', players });
}

export function announceJoin(playerName, playerAvatar, playerColor) {
  playerData = { name: playerName, avatar: playerAvatar, color: playerColor };
  sendToAll({
    type: 'JOIN_ANNOUNCE',
    playerId: myPlayerId,
    playerName,
    playerAvatar,
    playerColor
  });
}

export function onPlayersChanged(callback) {
  onPlayersChangedCallback = callback;
}

export function onGameStart(callback) {
  onGameStartCallback = callback;
}

export function launchGame(config) {
  sendToAll({ type: 'GAME_START', config });
}

export function getRoomCode() {
  return roomCode || (peer ? peer.id : null);
}

export function getMyPlayerId() {
  return myPlayerId;
}

export function disconnect() {
  Object.values(connections).forEach(conn => {
    try { conn.close(); } catch {}
  });
  connections = {};
  if (peer) {
    try { peer.destroy(); } catch {}
    peer = null;
  }
  roomCode = null;
  myPlayerId = null;
  playerData = null;
  onPlayersChangedCallback = null;
  onGameStartCallback = null;
}
