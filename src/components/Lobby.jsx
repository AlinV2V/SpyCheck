import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Users, Cpu, Shield, Play, Copy, Check, UserPlus, LogIn, Sliders, RefreshCw, UserCheck } from 'lucide-react';
import { BOT_PERSONALITIES } from '../services/botAI';
import { generateRoomCode } from '../services/roomState';
import { p2pNetwork } from '../services/p2pNetwork';
import { initAudio, playClick, setMuted, isMuted } from '../services/audio';

export const AVATAR_OPTIONS = [
  { id: 'cat', type: 'image', src: '/avatars/cat.jpg', label: 'Cyber Cat' },
  { id: 'doge', type: 'image', src: '/avatars/doge.jpg', label: 'Cyber Doge' },
  { id: 'frog', type: 'image', src: '/avatars/frog.jpg', label: 'Pepe Cyber' },
  { id: 'duck', type: 'image', src: '/avatars/duck.jpg', label: 'Detective Duck' },
  { id: 'hamster', type: 'image', src: '/avatars/hamster.jpg', label: 'Panic Hamster' },
  { id: 'shield', type: 'emoji', icon: '🛡️', label: 'Agent Shield' },
  { id: 'zap', type: 'emoji', icon: '⚡', label: 'Cyber Spark' },
  { id: 'ghost', type: 'emoji', icon: '👾', label: 'Netrunner' },
  { id: 'bot', type: 'emoji', icon: '🤖', label: 'Android Mech' },
  { id: 'crown', type: 'emoji', icon: '👑', label: 'High Ruler' }
];

const RANDOM_NAMES = ['Agent Alpha', 'Ghost Zero', 'CyberViper', 'Spectre-7', 'NeonPulse', 'ShadowByte', 'MatrixEcho'];

export function resolveAvatarSrc(avatar) {
  if (typeof avatar === 'string' && avatar.startsWith('/')) {
    const base = (import.meta.env.BASE_URL || './').replace(/\/$/, '');
    return `${base}${avatar}`;
  }
  return avatar;
}

export function RenderAvatar({ avatar, size = 48, borderColor = '#00f0ff' }) {
  if (!avatar) return <span style={{ fontSize: `${size * 0.7}px` }}>👤</span>;
  const src = resolveAvatarSrc(avatar);
  if (typeof src === 'string' && (src.startsWith('./') || src.startsWith('/') || src.startsWith('http') || src.includes('.jpg') || src.includes('.png'))) {
    return (
      <img
        src={src}
        alt="avatar"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 12px ${borderColor}80`,
          verticalAlign: 'middle',
          display: 'inline-block'
        }}
      />
    );
  }
  return <span style={{ fontSize: `${size * 0.7}px`, verticalAlign: 'middle' }}>{avatar}</span>;
}

export default function Lobby({ onStartGame }) {
  const urlParams = new URLSearchParams(window.location.search);
  const initialRoomFromUrl = urlParams.get('room') || '';

  // Navigation State: 'menu' | 'join' | 'room' | 'solo'
  const [viewState, setViewState] = useState(initialRoomFromUrl ? 'join' : 'menu');
  const [mode, setMode] = useState('solo_ai');

  // Room & Player State
  const [roomCode, setRoomCode] = useState(initialRoomFromUrl ? initialRoomFromUrl.toUpperCase() : '');
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('Agent Alpha');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/cat.jpg');
  const [selectedColor, setSelectedColor] = useState('#00f0ff');
  const [copiedCode, setCopiedCode] = useState(false);

  // Settings
  const [playerCount, setPlayerCount] = useState(4);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [fillWithBots, setFillWithBots] = useState(true);

  // Roster
  const [roomPlayers, setRoomPlayers] = useState([]);

  // P2P Broadcast Channel Connection
  useEffect(() => {
    if (viewState === 'room' && roomCode) {
      const myId = `user_${Math.random().toString(36).substring(2, 7)}`;
      p2pNetwork.connect(roomCode, myId, isHost);

      const unsubJoin = p2pNetwork.on('PLAYER_JOINED', (payload) => {
        if (isHost) {
          setRoomPlayers(prev => {
            if (prev.some(p => p.id === payload.playerId)) return prev;
            const updated = [...prev, {
              id: payload.playerId,
              name: payload.name || `Operator ${prev.length + 1}`,
              avatar: payload.avatar || '/avatars/cat.jpg',
              color: payload.color || '#00f0ff',
              isBot: false,
              isHost: false,
              isReady: true
            }];
            p2pNetwork.broadcastState({ roomPlayers: updated, mode, timerSeconds });
            return updated;
          });
        }
      });

      const unsubState = p2pNetwork.on('STATE_UPDATE', (payload) => {
        if (payload?.roomPlayers) {
          setRoomPlayers(payload.roomPlayers);
        }
      });

      const unsubStart = p2pNetwork.on('GAME_START', (payload) => {
        onStartGame(payload);
      });

      return () => {
        unsubJoin();
        unsubState();
        unsubStart();
      };
    }
  }, [viewState, roomCode, isHost]);

  // Handle Create Room
  const handleCreateRoom = () => {
    initAudio();
    playClick();
    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setIsHost(true);
    setMode('multiplayer');

    const hostPlayer = {
      id: 'p_host',
      name: playerName || 'Host Operator',
      avatar: selectedAvatar,
      color: selectedColor,
      isBot: false,
      isHost: true,
      isReady: true
    };

    setRoomPlayers([hostPlayer]);
    setViewState('room');
    window.history.pushState({}, '', `?room=${newCode}`);
  };

  // Handle Join Room
  const handleJoinRoom = () => {
    initAudio();
    playClick();
    if (!roomCode || roomCode.length < 3) return;

    const cleanCode = roomCode.trim().toUpperCase();
    setRoomCode(cleanCode);
    setIsHost(false);
    setMode('multiplayer');

    const myPlayer = {
      id: `p_${Math.random().toString(36).substring(2, 7)}`,
      name: playerName || 'Operator',
      avatar: selectedAvatar,
      color: selectedColor,
      isBot: false,
      isHost: false,
      isReady: true
    };

    setRoomPlayers(prev => [...prev, myPlayer]);
    setViewState('room');

    p2pNetwork.connect(cleanCode, myPlayer.id, false);
    p2pNetwork.sendAction('PLAYER_JOINED', myPlayer);
    window.history.pushState({}, '', `?room=${cleanCode}`);
  };

  // Handle Start Solo AI
  const handleStartSoloAI = () => {
    initAudio();
    playClick();

    const players = [];
    players.push({
      id: 'p1',
      name: playerName || 'Agent Alpha',
      avatar: selectedAvatar,
      color: selectedColor,
      isBot: false,
      isReady: true,
    });

    for (let i = 1; i < playerCount; i++) {
      const botPersona = BOT_PERSONALITIES[(i - 1) % BOT_PERSONALITIES.length];
      players.push({
        id: `bot_${i}`,
        name: botPersona.name,
        avatar: botPersona.avatar,
        color: botPersona.color,
        isBot: true,
        botPersona,
      });
    }

    onStartGame({
      mode: 'solo_ai',
      playerCount,
      timerSeconds,
      speechEnabled: true,
      players,
    });
  };

  // Host launches game for room
  const handleLaunchRoomGame = () => {
    initAudio();
    playClick();

    let finalPlayers = [...roomPlayers];
    if (fillWithBots && finalPlayers.length < playerCount) {
      const needed = playerCount - finalPlayers.length;
      for (let i = 0; i < needed; i++) {
        const botPersona = BOT_PERSONALITIES[i % BOT_PERSONALITIES.length];
        finalPlayers.push({
          id: `bot_fill_${i}`,
          name: botPersona.name,
          avatar: botPersona.avatar,
          color: botPersona.color,
          isBot: true,
          botPersona
        });
      }
    }

    const config = {
      mode: 'local_p2p',
      playerCount: finalPlayers.length,
      timerSeconds,
      speechEnabled: true,
      players: finalPlayers,
      roomCode
    };

    p2pNetwork.sendAction('GAME_START', config);
    onStartGame(config);
  };

  const copyRoomCode = () => {
    playClick();
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const randomizeName = () => {
    playClick();
    const rName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setPlayerName(rName);
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '20px auto',
      padding: '32px',
      borderRadius: '20px',
      background: 'rgba(10, 15, 26, 0.95)',
      border: '2px solid rgba(0, 240, 255, 0.4)',
      boxShadow: '0 0 50px rgba(0, 240, 255, 0.2), 0 0 20px rgba(0, 0, 0, 0.8)',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Game Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '2.8rem',
          fontWeight: 900,
          letterSpacing: '4px',
          color: '#00f0ff',
          textShadow: '0 0 20px rgba(0, 240, 255, 0.6)',
          margin: 0
        }}>
          INTRUDER CHECK
        </h1>
        <p style={{ color: '#94a3b8', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.2rem', marginTop: '6px', fontWeight: 600 }}>
          SOCIAL DEDUCTION PROTOCOL // ROOM PIPELINE
        </p>
      </div>

      {/* VIEW: MAIN MENU */}
      {viewState === 'menu' && (
        <div>
          {/* 3 Main Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '32px' }}>
            {/* Create Room */}
            <button
              onClick={handleCreateRoom}
              style={{
                padding: '28px 16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25) 0%, rgba(0, 180, 216, 0.1) 100%)',
                border: '2px solid #00f0ff',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
                cursor: 'pointer',
                textAlign: 'center',
                color: '#ffffff',
                transition: 'transform 0.2s ease'
              }}
            >
              <UserPlus size={42} color="#00f0ff" style={{ marginBottom: '12px' }} />
              <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.3rem', color: '#00f0ff', letterSpacing: '1px' }}>
                CREATE ROOM
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '8px', fontWeight: 500 }}>
                Host a new room & invite friends with Room Code
              </div>
            </button>

            {/* Join Room */}
            <button
              onClick={() => { playClick(); setViewState('join'); }}
              style={{
                padding: '28px 16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(0, 255, 170, 0.2) 0%, rgba(0, 255, 170, 0.05) 100%)',
                border: '2px solid #00ffaa',
                boxShadow: '0 0 25px rgba(0, 255, 170, 0.25)',
                cursor: 'pointer',
                textAlign: 'center',
                color: '#ffffff',
                transition: 'transform 0.2s ease'
              }}
            >
              <LogIn size={42} color="#00ffaa" style={{ marginBottom: '12px' }} />
              <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.3rem', color: '#00ffaa', letterSpacing: '1px' }}>
                JOIN ROOM
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '8px', fontWeight: 500 }}>
                Enter an existing 6-character Room Code
              </div>
            </button>

            {/* Solo VS Bots */}
            <button
              onClick={() => { playClick(); setViewState('solo'); }}
              style={{
                padding: '28px 16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.2) 0%, rgba(255, 170, 0, 0.05) 100%)',
                border: '2px solid #ffaa00',
                boxShadow: '0 0 25px rgba(255, 170, 0, 0.25)',
                cursor: 'pointer',
                textAlign: 'center',
                color: '#ffffff',
                transition: 'transform 0.2s ease'
              }}
            >
              <Cpu size={42} color="#ffaa00" style={{ marginBottom: '12px' }} />
              <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.3rem', color: '#ffaa00', letterSpacing: '1px' }}>
                VS AI BOTS
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '8px', fontWeight: 500 }}>
                Play solo against smart AI personas
              </div>
            </button>
          </div>

          {/* Player Customization Panel */}
          <div style={{
            background: 'rgba(18, 24, 38, 0.9)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{ fontFamily: 'Orbitron', color: '#00f0ff', marginTop: 0, fontSize: '1.1rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} /> OPERATOR DOSSIER & MEME AVATAR SETUP
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
              {/* Callsign Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>OPERATOR CALLSIGN / NAME:</label>
                  <button
                    onClick={randomizeName}
                    style={{ background: 'none', border: 'none', color: '#00f0ff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
                  >
                    <RefreshCw size={12} /> Randomize
                  </button>
                </div>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(6, 9, 15, 0.9)',
                    border: '2px solid #00f0ff',
                    color: '#ffffff',
                    fontFamily: 'Orbitron',
                    fontSize: '1.1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Meme Avatar Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>SELECT MEME AVATAR EMBLEM:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.map(opt => {
                    const avatarVal = opt.type === 'image' ? opt.src : opt.icon;
                    const isSelected = selectedAvatar === avatarVal;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => { setSelectedAvatar(avatarVal); playClick(); }}
                        title={opt.label}
                        style={{
                          padding: '6px',
                          borderRadius: '50%',
                          background: isSelected ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                          border: isSelected ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: isSelected ? '0 0 16px rgba(0, 240, 255, 0.8)' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <RenderAvatar avatar={avatarVal} size={42} borderColor={isSelected ? '#00f0ff' : 'transparent'} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: JOIN ROOM CODE INPUT */}
      {viewState === 'join' && (
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Orbitron', color: '#00ffaa', fontSize: '1.6rem', marginBottom: '20px', letterSpacing: '1px' }}>
            ENTER 6-CHARACTER ROOM CODE
          </h3>
          <input
            type="text"
            placeholder="e.g. CYBER7"
            value={roomCode}
            maxLength={6}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '12px',
              background: 'rgba(6, 9, 15, 0.9)',
              border: '3px solid #00ffaa',
              color: '#00ffaa',
              fontFamily: 'Orbitron',
              fontSize: '2.4rem',
              textAlign: 'center',
              letterSpacing: '8px',
              boxShadow: '0 0 30px rgba(0, 255, 170, 0.3)',
              marginBottom: '24px',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', gap: '14px' }}>
            <button
              disabled={!roomCode || roomCode.length < 3}
              onClick={handleJoinRoom}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '10px',
                background: 'linear-gradient(90deg, #00ffaa 0%, #00f0ff 100%)',
                color: '#000',
                fontFamily: 'Orbitron',
                fontWeight: 900,
                fontSize: '1.2rem',
                border: 'none',
                cursor: roomCode ? 'pointer' : 'not-allowed',
                boxShadow: '0 0 25px rgba(0, 255, 170, 0.4)'
              }}
            >
              JOIN ROOM NOW
            </button>
            <button
              onClick={() => { playClick(); setViewState('menu'); }}
              style={{
                padding: '16px 24px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontFamily: 'Orbitron',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer'
              }}
            >
              BACK
            </button>
          </div>
        </div>
      )}

      {/* VIEW: ACTIVE ROOM WAITING LOBBY */}
      {viewState === 'room' && (
        <div>
          {/* Room Code Display Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.05) 100%)',
            border: '2px dashed #00f0ff',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontFamily: 'Orbitron', letterSpacing: '2px' }}>
              SHARE THIS ROOM CODE WITH FRIENDS
            </div>
            <div style={{ fontSize: '3.6rem', fontWeight: 900, color: '#00f0ff', fontFamily: 'Orbitron', letterSpacing: '10px', margin: '8px 0', textShadow: '0 0 25px rgba(0, 240, 255, 0.8)' }}>
              {roomCode}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={copyRoomCode}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: '#00f0ff',
                  color: '#000',
                  border: 'none',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Orbitron',
                  fontSize: '0.95rem'
                }}
              >
                {copiedCode ? <Check size={18} /> : <Copy size={18} />}
                {copiedCode ? 'COPIED TO CLIPBOARD!' : 'COPY ROOM CODE'}
              </button>
            </div>
          </div>

          {/* Connected Roster */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'Orbitron', color: '#fff', fontSize: '1.2rem', margin: 0, letterSpacing: '1px' }}>
                CONNECTED OPERATORS ({roomPlayers.length} / {playerCount})
              </h3>
              {isHost && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#ffaa00', cursor: 'pointer', fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    checked={fillWithBots}
                    onChange={e => setFillWithBots(e.target.checked)}
                    style={{ accentColor: '#ffaa00', width: '18px', height: '18px' }}
                  />
                  Fill empty slots with AI Bots
                </label>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {roomPlayers.map((p, idx) => (
                <div key={p.id || idx} style={{
                  background: 'rgba(0, 240, 255, 0.12)',
                  border: p.isHost ? '2px solid #00f0ff' : '1px solid rgba(0, 255, 170, 0.5)',
                  borderRadius: '12px',
                  padding: '18px',
                  textAlign: 'center'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <RenderAvatar avatar={p.avatar} size={56} borderColor={p.color || '#00f0ff'} />
                  </div>
                  <div style={{ fontWeight: 900, color: p.color || '#fff', fontSize: '1.05rem', fontFamily: 'Orbitron' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: p.isHost ? '#00f0ff' : '#00ffaa', marginTop: '6px', fontWeight: 900, fontFamily: 'Orbitron' }}>
                    {p.isHost ? 'ROOM HOST' : 'READY'}
                  </div>
                </div>
              ))}

              {Array.from({ length: Math.max(0, playerCount - roomPlayers.length) }).map((_, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '18px',
                  textAlign: 'center',
                  opacity: 0.6
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <RenderAvatar avatar={fillWithBots ? '/avatars/cat.jpg' : '👤'} size={56} borderColor="#64748b" />
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#888', fontFamily: 'Orbitron', fontWeight: 700 }}>
                    {fillWithBots ? `BOT SLOT ${idx + 1}` : 'WAITING...'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Launch Action */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {isHost ? (
              <button
                onClick={handleLaunchRoomGame}
                style={{
                  flex: 1,
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #00f0ff 0%, #00ffaa 100%)',
                  color: '#000',
                  fontFamily: 'Orbitron',
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  letterSpacing: '2px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)'
                }}
              >
                <Play fill="#000" size={24} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
                START SECURITY CHECK
              </button>
            ) : (
              <div style={{ flex: 1, padding: '18px', textAlign: 'center', background: 'rgba(0,255,170,0.1)', border: '1px solid #00ffaa', borderRadius: '12px', color: '#00ffaa', fontFamily: 'Orbitron', fontWeight: 700 }}>
                WAITING FOR ROOM HOST TO START GAME...
              </div>
            )}
            <button
              onClick={() => { playClick(); setViewState('menu'); }}
              style={{ padding: '18px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'Orbitron', cursor: 'pointer' }}
            >
              LEAVE LOBBY
            </button>
          </div>
        </div>
      )}

      {/* VIEW: SOLO BOTS CONFIG */}
      {viewState === 'solo' && (
        <div>
          <h3 style={{ fontFamily: 'Orbitron', color: '#ffaa00', fontSize: '1.4rem', marginBottom: '20px', letterSpacing: '1px' }}>
            SOLO VS AI BOTS SETUP
          </h3>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '10px', fontWeight: 600 }}>Total Active Stations:</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setPlayerCount(num)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    background: playerCount === num ? '#ffaa00' : 'rgba(255,255,255,0.05)',
                    color: playerCount === num ? '#000' : '#fff',
                    border: 'none',
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontFamily: 'Orbitron',
                    fontSize: '1.1rem'
                  }}
                >
                  {num} PLAYERS
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button
              onClick={handleStartSoloAI}
              style={{
                flex: 1,
                padding: '20px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #ffaa00 0%, #00ffaa 100%)',
                color: '#000',
                fontFamily: 'Orbitron',
                fontWeight: 900,
                fontSize: '1.3rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(255, 170, 0, 0.4)'
              }}
            >
              START BOTS SESSION NOW
            </button>
            <button
              onClick={() => { playClick(); setViewState('menu'); }}
              style={{ padding: '20px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'Orbitron', cursor: 'pointer' }}
            >
              BACK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
