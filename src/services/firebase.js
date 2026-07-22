import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off, push, remove, onDisconnect, serverTimestamp } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBoA5gHWybs8KxA0pMWETQlBepPZ3HQGP0",
  authDomain: "spycheck-multiplayer.firebaseapp.com",
  databaseURL: "https://spycheck-multiplayer-default-rtdb.firebaseio.com",
  projectId: "spycheck-multiplayer",
  storageBucket: "spycheck-multiplayer.firebasestorage.app",
  messagingSenderId: "1012987463292",
  appId: "1:1012987463292:web:7a8b9c0d1e2f3a4b5c6d7e"
};

let app = null;
let db = null;
let auth = null;
let authReady = false;
const authQueue = [];

function getFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        authReady = true;
        authQueue.forEach(fn => fn(user.uid));
        authQueue.length = 0;
      } else {
        signInAnonymously(auth).catch(() => {});
      }
    });
  }
  return { db, auth };
}

function ensureAuth() {
  getFirebase();
  return new Promise((resolve) => {
    if (authReady && auth.currentUser) {
      resolve(auth.currentUser.uid);
    } else {
      authQueue.push((uid) => resolve(uid));
      if (!auth.currentUser && auth) {
        signInAnonymously(auth).catch(() => {});
      }
    }
  });
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePlayerId() {
  return 'p_' + Math.random().toString(36).substring(2, 10);
}

export async function createRoom(hostPlayerData) {
  const { db } = getFirebase();
  const uid = await ensureAuth();
  const roomCode = generateRoomCode();
  const playerId = generatePlayerId();

  const roomRef = ref(db, `rooms/${roomCode}`);
  await set(roomRef, {
    hostId: uid,
    createdAt: serverTimestamp(),
    playerCount: 0
  });

  const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
  await set(playerRef, {
    ...hostPlayerData,
    uid,
    joinedAt: serverTimestamp(),
    isHost: true,
    isReady: true
  });

  onDisconnect(playerRef).remove();

  return { roomCode, playerId, uid };
}

export async function joinRoom(roomCode, playerData) {
  const { db } = getFirebase();
  const uid = await ensureAuth();

  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const playerId = generatePlayerId();
  const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);

  const existing = await get(ref(db, `rooms/${roomCode}/players`));
  const existingPlayers = existing.val() || {};
  const alreadyHere = Object.values(existingPlayers).some(p => p.uid === uid);

  if (alreadyHere) {
    const existingPlayer = Object.entries(existingPlayers).find(([_, p]) => p.uid === uid);
    if (existingPlayer) {
      await set(ref(db, `rooms/${roomCode}/players/${existingPlayer[0]}`), {
        ...playerData,
        uid,
        joinedAt: serverTimestamp(),
        isHost: false,
        isReady: true
      });
      return { roomCode, playerId: existingPlayer[0], uid };
    }
  }

  await set(playerRef, {
    ...playerData,
    uid,
    joinedAt: serverTimestamp(),
    isHost: false,
    isReady: true
  });

  onDisconnect(playerRef).remove();

  return { roomCode, playerId, uid };
}

export function onRoomPlayersChanged(roomCode, callback) {
  const { db } = getFirebase();
  const playersRef = ref(db, `rooms/${roomCode}/players`);
  onValue(playersRef, (snapshot) => {
    const data = snapshot.val();
    const players = data ? Object.entries(data).map(([id, p]) => ({ id, ...p })) : [];
    callback(players);
  });
  return () => off(playersRef);
}

export function onGameStart(roomCode, callback) {
  const { db } = getFirebase();
  const stateRef = ref(db, `rooms/${roomCode}/gameAction`);
  onValue(stateRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.action === 'GAME_START') {
      callback(data.config);
    }
  });
  return () => off(stateRef);
}

export async function launchGame(roomCode, config) {
  const { db } = getFirebase();

  const playersRef = ref(db, `rooms/${roomCode}/players`);
  const snapshot = await get(playersRef);
  const players = snapshot.val();
  const playerList = players ? Object.entries(players).map(([id, p]) => ({ id, ...p })) : [];

  const actionRef = ref(db, `rooms/${roomCode}/gameAction`);
  await set(actionRef, {
    action: 'GAME_START',
    config: { ...config, players: playerList },
    timestamp: serverTimestamp()
  });
}

export function leaveRoom(roomCode, playerId) {
  const { db } = getFirebase();
  if (roomCode && playerId) {
    const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
    remove(playerRef).catch(() => {});
  }
}

export async function destroyRoom(roomCode) {
  const { db } = getFirebase();
  const roomRef = ref(db, `rooms/${roomCode}`);
  await remove(roomRef);
}
