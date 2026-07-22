import React, { useState } from 'react';
import ControlRoomScene from './3d/ControlRoomScene';
import Lobby from './components/Lobby';
import { getRandomQuestions } from './data/questionBank';
import { playClick, playTerminalPowerOn, setMuted } from './services/audio';
import { Shield, Radio, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import './index.css';

export function App() {
  const [gameState, setGameState] = useState(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [audioMuted, setAudioMuted] = useState(false);

  const toggleMute = () => {
    const next = !audioMuted;
    setAudioMuted(next);
    setMuted(next);
  };

  const handlePurgeCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(r => r.unregister());
        });
      }
    } catch (err) {
      console.warn('Purge error:', err);
    }
    window.location.reload(true);
  };

  const handleStartGame = (config) => {
    playTerminalPowerOn();

    // 1. Initialize player roster first
    const players = Array.from({ length: config.playerCount }, (_, i) => ({
      id: `p${i + 1}`,
      name: i === 0 ? 'Agent Alpha' : `Agent 0${i + 1}`,
      isAI: i > 0 && config.mode === 'solo_ai',
      isReady: true,
      hasAnswered: false,
    }));

    // 2. Pass players roster into getRandomQuestions so player-name options populate correctly
    const qList = getRandomQuestions(3, players);
    const randomQuestion = qList[0];
    const spyIdx = Math.floor(Math.random() * config.playerCount);

    setGameState({
      mode: config.mode,
      players,
      spyIndex: spyIdx,
      currentQuestion: randomQuestion,
      questionPool: qList,
      currentRound: 1,
      currentPhase: 'question',
      timerSeconds: 45,
      playerAnswers: {},
      playerVotes: {},
    });
    setActivePlayerIndex(0);
  };

  const handleSelectOption = (optionIndex) => {
    if (!gameState || gameState.currentPhase !== 'question') return;
    setGameState(prev => {
      const answers = { ...(prev.playerAnswers || {}) };
      answers[activePlayerIndex] = optionIndex;
      return { ...prev, playerAnswers: answers };
    });
  };

  const handleConfirmAnswer = () => {
    if (!gameState || gameState.currentPhase !== 'question') return;
    playClick();

    const totalPlayers = gameState.players.length;
    const nextIdx = activePlayerIndex + 1;

    if (nextIdx < totalPlayers && !gameState.players[nextIdx].isAI) {
      setActivePlayerIndex(nextIdx);
    } else {
      playTerminalPowerOn();
      setGameState(prev => {
        const answers = { ...(prev.playerAnswers || {}) };
        prev.players.forEach((p, idx) => {
          if (p.isAI && answers[idx] === undefined) {
            answers[idx] = Math.floor(Math.random() * Math.min(4, prev.players.length));
          }
        });
        return {
          ...prev,
          playerAnswers: answers,
          isAnswerConfirmed: true,
          currentPhase: 'discussion',
          timerSeconds: 45,
        };
      });
      setActivePlayerIndex(0);
    }
  };

  const handleProceedToVote = () => {
    if (!gameState) return;
    playTerminalPowerOn();
    setGameState(prev => ({
      ...prev,
      currentPhase: 'voting',
      timerSeconds: 30,
    }));
  };

  const handleCastVote = (targetPlayerIndex) => {
    if (!gameState || gameState.currentPhase !== 'voting') return;
    playClick();
    setGameState(prev => {
      const votes = { ...(prev.playerVotes || {}) };
      votes[activePlayerIndex] = targetPlayerIndex;
      return { ...prev, playerVotes: votes };
    });
  };

  const handleProceedToResolution = () => {
    if (!gameState) return;
    playTerminalPowerOn();
    setGameState(prev => {
      const votes = { ...(prev.playerVotes || {}) };
      
      // Auto-generate AI bot votes if in solo AI mode
      prev.players.forEach((p, idx) => {
        if (p.isAI && votes[idx] === undefined) {
          votes[idx] = Math.floor(Math.random() * prev.players.length);
        }
      });

      const voteCounts = {};
      Object.values(votes).forEach(target => {
        voteCounts[target] = (voteCounts[target] || 0) + 1;
      });

      let maxVotes = 0;
      let accusedIdx = null;
      Object.entries(voteCounts).forEach(([idx, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          accusedIdx = parseInt(idx, 10);
        }
      });

      const isSpyCaught = accusedIdx === prev.spyIndex;
      const currentRound = prev.currentRound || 1;

      // Rule 1: If Intruder is accused -> Agents Win immediately!
      if (isSpyCaught) {
        return {
          ...prev,
          accusedPlayerIndex: accusedIdx,
          winner: 'agents',
          currentPhase: 'victory',
        };
      }
      // Rule 2: If Round 3 ends and Intruder survived -> Intruder Wins!
      else if (currentRound >= 3) {
        return {
          ...prev,
          accusedPlayerIndex: accusedIdx,
          winner: 'spy',
          currentPhase: 'victory',
        };
      }
      // Rule 3: Wrong vote on Round 1 or 2 -> Advance to Next Round (Round 2 or 3)!
      else {
        const nextRound = currentRound + 1;
        const nextQ = prev.questionPool?.[nextRound - 1] || getRandomQuestions(1, prev.players)[0];

        return {
          ...prev,
          accusedPlayerIndex: accusedIdx,
          currentRound: nextRound,
          currentQuestion: nextQ,
          currentPhase: 'question',
          playerAnswers: {},
          playerVotes: {},
          timerSeconds: 45,
        };
      }
    });
  };

  const handleRematch = () => {
    if (!gameState) return;
    handleStartGame({
      mode: gameState.mode,
      playerCount: gameState.players.length,
    });
  };

  const handleReturnToLobby = () => {
    setGameState(null);
    setActivePlayerIndex(0);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#040711' }}>
      {/* 3D Command Room Background Scene & Virtual Computer Monitors */}
      <ControlRoomScene
        gameState={gameState}
        currentPhase={gameState?.winner ? 'victory' : (gameState?.currentPhase || 'lobby')}
        activePlayerIndex={activePlayerIndex}
        onSelectOption={handleSelectOption}
        onConfirmAnswer={handleConfirmAnswer}
        onProceedToVote={handleProceedToVote}
        onCastVote={handleCastVote}
        onProceedToResolution={handleProceedToResolution}
        onRematch={handleRematch}
        onReturnToLobby={handleReturnToLobby}
      />

      {/* Global Top HUD Header Bar */}
      <header className="hud-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(4,7,17,0.95) 0%, rgba(4,7,17,0) 100%)',
        zIndex: 100,
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield color="#00ffaa" size={24} />
          <span style={{ fontFamily: 'Orbitron', fontWeight: 900, color: '#00ffaa', fontSize: '1.2rem', letterSpacing: '1.5px' }}>
            INTRUDER CHECK
          </span>
          <span style={{ fontSize: '0.7rem', background: '#00ff66', color: '#000000', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontFamily: 'Orbitron', marginLeft: '8px' }}>
            v1.0.30
          </span>
          {gameState && (
            <span className="badge-agent" style={{ marginLeft: '10px', background: 'rgba(0,255,170,0.15)', border: '1px solid #00ffaa', color: '#00ffaa' }}>
              ROUND {gameState.currentRound} / 3
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Explicit Manual Cache Purge Button */}
          <button
            onClick={handlePurgeCache}
            title="Purge Browser Cache & Hard Reload"
            style={{
              background: 'rgba(0, 255, 170, 0.1)',
              border: '1px solid #00ffaa',
              borderRadius: '6px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#00ffaa',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(0, 255, 170, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} color="#ffb700" /> PURGE CACHE & RELOAD
          </button>

          {gameState && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#ffb700', fontFamily: 'Rajdhani', fontWeight: 700 }}>
              <Radio color="#00ffaa" size={16} /> MODE: {gameState.mode.toUpperCase()}
            </div>
          )}

          <button
            onClick={toggleMute}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(0,255,170,0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: audioMuted ? '#ffb700' : '#00ffaa',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Viewport Shell — Gameplay UI occurs 100% on the 3D Virtual Computer Monitor inside ControlRoomScene */}
      <main style={{
        position: 'absolute',
        top: '65px',
        left: 0,
        width: '100%',
        height: 'calc(100vh - 65px)',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        {!gameState ? (
          <div style={{ pointerEvents: 'auto' }}>
            <Lobby onStartGame={handleStartGame} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
