import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Users, Cpu, Shield, Play, Copy, Check, UserPlus, LogIn, Sliders, RefreshCw, UserCheck, Monitor, Wifi, Power, Maximize2, Minimize2, X, Terminal, Clock, Search } from 'lucide-react';
import { BOT_PERSONALITIES } from '../services/botAI';
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

export function RenderAvatar({ avatar, size = 48, borderColor = '#3b82f6' }) {
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

  const [viewState, setViewState] = useState(initialRoomFromUrl ? 'join' : 'menu');
  const [mode, setMode] = useState('solo_ai');

  const [roomCode, setRoomCode] = useState(initialRoomFromUrl ? initialRoomFromUrl.toUpperCase() : '');
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('Agent Alpha');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/cat.jpg');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [copiedCode, setCopiedCode] = useState(false);

  const [playerCount, setPlayerCount] = useState(4);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [fillWithBots, setFillWithBots] = useState(true);

  const [roomPlayers, setRoomPlayers] = useState([]);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (viewState === 'room' && roomCode) {
      const unsubState = p2pNetwork.on('STATE_UPDATE', (payload) => {
        if (payload?.roomPlayers) {
          setRoomPlayers(payload.roomPlayers);
        }
      });

      const unsubStart = p2pNetwork.on('GAME_START', (payload) => {
        onStartGame(payload);
      });

      return () => {
        unsubState();
        unsubStart();
        p2pNetwork.disconnect();
      };
    }
  }, [viewState, roomCode]);

  const handleCreateRoom = async () => {
    initAudio();
    playClick();
    setIsHost(true);
    setMode('multiplayer');

    const playerData = {
      name: playerName || 'Host Operator',
      avatar: selectedAvatar,
      color: selectedColor,
    };

    try {
      await p2pNetwork.connect('', '', true, playerData);
      const newCode = p2pNetwork.roomCode;
      setRoomCode(newCode);

      const hostPlayer = {
        id: p2pNetwork.playerId,
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
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleJoinRoom = async () => {
    initAudio();
    playClick();
    if (!roomCode || roomCode.length < 3) return;

    const cleanCode = roomCode.trim().toUpperCase();
    setRoomCode(cleanCode);
    setIsHost(false);
    setMode('multiplayer');

    const playerData = {
      name: playerName || 'Operator',
      avatar: selectedAvatar,
      color: selectedColor,
    };

    try {
      await p2pNetwork.joinAsGuest(cleanCode, playerData);

      const myPlayer = {
        id: p2pNetwork.playerId,
        name: playerName || 'Operator',
        avatar: selectedAvatar,
        color: selectedColor,
        isBot: false,
        isHost: false,
        isReady: true
      };

      setRoomPlayers(prev => [...prev, myPlayer]);
      setViewState('room');
      window.history.pushState({}, '', `?room=${cleanCode}`);
    } catch (err) {
      console.error('Failed to join room:', err);
      alert('Room not found. Check the code and try again.');
    }
  };

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

  const handleLaunchRoomGame = async () => {
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

    await p2pNetwork.sendAction('GAME_START', config);
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

  const windowTitle = viewState === 'menu' ? 'PLAYER CONFIGURATION'
    : viewState === 'join' ? 'JOIN ROOM'
    : viewState === 'solo' ? 'SOLO VS BOTS'
    : 'ROOM LOBBY';

  return (
    <div style={{ maxWidth: '960px', margin: '24px auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes lobby-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes lobby-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes lobby-scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes lobby-glare {
          0% { opacity: 0.03; }
          50% { opacity: 0.07; }
          100% { opacity: 0.03; }
        }
        @keyframes lobby-slideup {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          background: '#0a1225',
          border: '3px solid #1e293b',
          borderRadius: '16px',
          boxShadow: '0 0 60px rgba(59, 130, 246, 0.15), 0 30px 80px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.02) 100%)',
            pointerEvents: 'none',
            zIndex: 40,
            animation: 'lobby-glare 4s ease-in-out infinite'
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 20px',
            background: '#080d18',
            borderBottom: '1px solid #1e293b',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Monitor size={14} color="#3b82f6" />
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#3b82f6',
              letterSpacing: '2px',
              textShadow: '0 0 8px rgba(59, 130, 246, 0.4)'
            }}>
              BLUE-OS v3.1 // SECURE TERMINAL
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wifi size={12} color="#3b82f6" style={{ animation: 'lobby-pulse 2s infinite' }} />
            <span style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '1px' }}>CONNECTED</span>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px #3b82f6', animation: 'lobby-blink 2s infinite' }} />
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px #3b82f6', animation: 'lobby-pulse 1.5s infinite' }} />
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            padding: '24px 20px 18px',
            minHeight: '380px',
            zIndex: 5
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)',
              pointerEvents: 'none',
              zIndex: 35,
              animation: 'lobby-scanline 0.1s linear infinite'
            }}
          />

          <div style={{
            backgroundColor: 'rgba(15, 24, 48, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1)',
            overflow: 'hidden',
            animation: 'lobby-slideup 0.4s ease forwards',
            position: 'relative',
            zIndex: 5
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 14px',
              height: '38px',
              background: '#0c1528',
              borderBottom: '1px solid #1e293b',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={13} color="#3b82f6" />
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#f8fafc',
                  letterSpacing: '0.5px'
                }}>
                  {windowTitle}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '4px', cursor: 'default',
                  color: '#94a3b8', fontSize: '12px'
                }}>
                  <Minimize2 size={10} />
                </div>
                <div style={{
                  width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '4px', cursor: 'default',
                  color: '#94a3b8', fontSize: '12px'
                }}>
                  <Maximize2 size={10} />
                </div>
                <div style={{
                  width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '4px', cursor: 'pointer',
                  color: '#94a3b8', fontSize: '12px'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.7)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <X size={10} />
                </div>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {viewState === 'menu' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.3px' }}>
                          OPERATOR CALLSIGN
                        </label>
                        <button
                          onClick={randomizeName}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '4px',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            padding: '3px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'; }}
                        >
                          <RefreshCw size={11} /> RANDOMIZE
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={playerName}
                          onChange={e => setPlayerName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '8px',
                            background: '#060b1a',
                            border: '2px solid rgba(59, 130, 246, 0.3)',
                            color: '#f8fafc',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            boxSizing: 'border-box',
                            outline: 'none',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            letterSpacing: '0.3px'
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.boxShadow = '0 0 16px rgba(59, 130, 246, 0.3)';
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '2px',
                          height: '18px',
                          background: '#3b82f6',
                          animation: 'lobby-blink 1s step-end infinite',
                          pointerEvents: 'none'
                        }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: '10px', letterSpacing: '0.3px' }}>
                        MEME AVATAR EMBLEM
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {AVATAR_OPTIONS.map(opt => {
                          const avatarVal = opt.type === 'image' ? opt.src : opt.icon;
                          const isSelected = selectedAvatar === avatarVal;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => { setSelectedAvatar(avatarVal); playClick(); }}
                              title={opt.label}
                              style={{
                                padding: '5px',
                                borderRadius: '50%',
                                background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                                border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(30, 41, 59, 0.6)',
                                boxShadow: isSelected ? '0 0 16px rgba(59, 130, 246, 0.5)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease'
                              }}
                              onMouseEnter={e => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                  e.currentTarget.style.transform = 'scale(1.08)';
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.6)';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }
                              }}
                            >
                              <RenderAvatar avatar={avatarVal} size={40} borderColor={isSelected ? '#3b82f6' : 'transparent'} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewState === 'join' && (
                <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#3b82f6',
                    marginBottom: '20px',
                    letterSpacing: '0.5px'
                  }}>
                    ENTER 6-CHARACTER ROOM CODE
                  </div>
                  <input
                    type="text"
                    placeholder="CYBER7"
                    value={roomCode}
                    maxLength={6}
                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '18px',
                      borderRadius: '10px',
                      background: '#060b1a',
                      border: '2px solid #3b82f6',
                      color: '#3b82f6',
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '2.2rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      letterSpacing: '10px',
                      boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                      marginBottom: '22px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      disabled={!roomCode || roomCode.length < 3}
                      onClick={handleJoinRoom}
                      style={{
                        flex: 1,
                        padding: '14px 24px',
                        borderRadius: '8px',
                        background: roomCode && roomCode.length >= 3
                          ? 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)'
                          : '#1e293b',
                        color: roomCode && roomCode.length >= 3 ? '#fff' : '#64748b',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        border: 'none',
                        cursor: roomCode && roomCode.length >= 3 ? 'pointer' : 'not-allowed',
                        boxShadow: roomCode && roomCode.length >= 3 ? '0 0 25px rgba(59, 130, 246, 0.4)' : 'none',
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.5px'
                      }}
                      onMouseEnter={e => {
                        if (roomCode && roomCode.length >= 3) {
                          e.currentTarget.style.boxShadow = '0 0 35px rgba(59, 130, 246, 0.6)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (roomCode && roomCode.length >= 3) {
                          e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.4)';
                        }
                      }}
                    >
                      JOIN ROOM NOW
                    </button>
                    <button
                      onClick={() => { playClick(); setViewState('menu'); }}
                      style={{
                        padding: '14px 24px',
                        borderRadius: '8px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        color: '#94a3b8',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        border: '1px solid rgba(30, 41, 59, 0.8)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)'; e.currentTarget.style.color = '#f8fafc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      BACK
                    </button>
                  </div>
                </div>
              )}

              {viewState === 'room' && (
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.04) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    borderRadius: '10px',
                    padding: '20px',
                    textAlign: 'center',
                    marginBottom: '24px',
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)'
                  }}>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '2px', marginBottom: '6px' }}>
                      SHARE THIS ROOM CODE
                    </div>
                    <div style={{
                      fontSize: '3.2rem',
                      fontWeight: 900,
                      color: '#3b82f6',
                      fontFamily: "'Orbitron', sans-serif",
                      letterSpacing: '12px',
                      margin: '6px 0',
                      textShadow: '0 0 30px rgba(59, 130, 246, 0.6)'
                    }}>
                      {roomCode}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={copyRoomCode}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '6px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 0 16px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(59, 130, 246, 0.5)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(59, 130, 246, 0.3)'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                        {copiedCode ? 'COPIED!' : 'COPY ROOM CODE'}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
                        CONNECTED OPERATORS ({roomPlayers.length} / {playerCount})
                      </div>
                      {isHost && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', color: '#f59e0b', cursor: 'pointer', fontWeight: 600 }}>
                          <input
                            type="checkbox"
                            checked={fillWithBots}
                            onChange={e => setFillWithBots(e.target.checked)}
                            style={{ accentColor: '#f59e0b', width: '16px', height: '16px' }}
                          />
                          Fill empty slots with AI bots
                        </label>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                      {roomPlayers.map((p, idx) => (
                        <div key={p.id || idx} style={{
                          background: 'rgba(59, 130, 246, 0.08)',
                          border: p.isHost ? '2px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '10px',
                          padding: '16px',
                          textAlign: 'center',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{ marginBottom: '8px' }}>
                            <RenderAvatar avatar={p.avatar} size={50} borderColor={p.color || '#3b82f6'} />
                          </div>
                          <div style={{ fontWeight: 700, color: p.color || '#f8fafc', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: p.isHost ? '#3b82f6' : '#06b6d4', marginTop: '5px', fontWeight: 700, letterSpacing: '1px' }}>
                            {p.isHost ? 'HOST' : 'READY'}
                          </div>
                        </div>
                      ))}

                      {Array.from({ length: Math.max(0, playerCount - roomPlayers.length) }).map((_, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px dashed rgba(30, 41, 59, 0.5)',
                          borderRadius: '10px',
                          padding: '16px',
                          textAlign: 'center',
                          opacity: 0.5
                        }}>
                          <div style={{ marginBottom: '8px' }}>
                            <RenderAvatar avatar={fillWithBots ? '/avatars/cat.jpg' : '👤'} size={50} borderColor="#64748b" />
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                            {fillWithBots ? `BOT SLOT ${idx + 1}` : 'WAITING...'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    {isHost ? (
                      <button
                        onClick={handleLaunchRoomGame}
                        style={{
                          flex: 1,
                          padding: '16px',
                          borderRadius: '8px',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
                          color: '#fff',
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          letterSpacing: '1px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.6)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.4)'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <Play fill="#fff" size={20} />
                        START SECURITY CHECK
                      </button>
                    ) : (
                      <div style={{ flex: 1, padding: '16px', textAlign: 'center', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem' }}>
                        WAITING FOR ROOM HOST TO START...
                      </div>
                    )}
                    <button
                      onClick={() => { playClick(); setViewState('menu'); }}
                      style={{
                        padding: '16px 24px',
                        borderRadius: '8px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        color: '#94a3b8',
                        border: '1px solid rgba(30, 41, 59, 0.8)',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)'; e.currentTarget.style.color = '#f8fafc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      LEAVE
                    </button>
                  </div>
                </div>
              )}

              {viewState === 'solo' && (
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#3b82f6', marginBottom: '18px', letterSpacing: '0.5px' }}>
                    SOLO VS AI BOTS SETUP
                  </div>
                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px', fontWeight: 600 }}>
                      Total Active Stations:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          onClick={() => { setPlayerCount(num); playClick(); }}
                          style={{
                            flex: 1,
                            padding: '13px',
                            borderRadius: '8px',
                            background: playerCount === num ? '#3b82f6' : 'rgba(255, 255, 255, 0.04)',
                            color: playerCount === num ? '#fff' : '#94a3b8',
                            border: playerCount === num ? 'none' : '1px solid rgba(30, 41, 59, 0.6)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => {
                            if (playerCount !== num) {
                              e.currentTarget.style.borderColor = '#3b82f6';
                              e.currentTarget.style.color = '#f8fafc';
                            }
                          }}
                          onMouseLeave={e => {
                            if (playerCount !== num) {
                              e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.6)';
                              e.currentTarget.style.color = '#94a3b8';
                            }
                          }}
                        >
                          {num} PLAYERS
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleStartSoloAI}
                      style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '8px',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
                        color: '#fff',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.5px'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.6)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.4)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      START BOTS SESSION
                    </button>
                    <button
                      onClick={() => { playClick(); setViewState('menu'); }}
                      style={{
                        padding: '16px 24px',
                        borderRadius: '8px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        color: '#94a3b8',
                        border: '1px solid rgba(30, 41, 59, 0.8)',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)'; e.currentTarget.style.color = '#f8fafc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      BACK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '6px 16px',
            background: '#060b1a',
            borderTop: '1px solid #1e293b',
            position: 'relative',
            zIndex: 10,
            minHeight: '52px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}>
            {[
              { label: 'NEW GAME', icon: <UserPlus size={16} />, onClick: handleCreateRoom, view: 'room' },
              { label: 'JOIN ROOM', icon: <LogIn size={16} />, onClick: () => { playClick(); setViewState('join'); }, view: 'join' },
              { label: 'VS BOTS', icon: <Cpu size={16} />, onClick: () => { playClick(); setViewState('solo'); }, view: 'solo' },
              { label: 'SETTINGS', icon: <Sliders size={16} />, onClick: () => { playClick(); setViewState('menu'); }, view: 'menu' }
            ].map((btn) => {
              const isActive = viewState === btn.view;
              return (
                <button
                  key={btn.label}
                  onClick={btn.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 18px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
                    color: isActive ? '#3b82f6' : '#64748b',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.5px',
                    boxShadow: isActive ? '0 0 16px rgba(59, 130, 246, 0.25)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  {React.cloneElement(btn.icon, { color: isActive ? '#3b82f6' : '#64748b', size: 16 })}
                  {btn.label}
                </button>
              );
            })}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingLeft: '16px',
            borderLeft: '1px solid #1e293b',
            color: '#64748b',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap'
          }}>
            <Clock size={12} />
            <span>{currentTime || '--:--'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
