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

    let players;
    if (config.players && config.players.length > 0) {
      players = config.players;
    } else {
      players = Array.from({ length: config.playerCount }, (_, i) => ({
        id: `p${i + 1}`,
        name: i === 0 ? 'Agent Alpha' : `Agent 0${i + 1}`,
        isAI: i > 0 && config.mode === 'solo_ai',
        isReady: true,
        hasAnswered: false,
      }));
    }

    const qList = getRandomQuestions(3, players);
    const randomQuestion = qList[0];
    const spyIdx = Math.floor(Math.random() * players.length);

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
            answers[idx] = Math.floor(Math.random() * prev.players.length);
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
    if (!gameState || gameState.currentPhase !== 'discussion') return;
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

    const fallbackQuestion = getRandomQuestions(1, gameState.players)[0];

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

      const roundEntry = {
        roundNumber: currentRound,
        question: prev.currentQuestion,
        answers: prev.playerAnswers,
        votes,
        accusedIndex: accusedIdx,
        isSpyCaught,
      };

      if (isSpyCaught) {
        return {
          ...prev,
          accusedPlayerIndex: accusedIdx,
          winner: 'agents',
          currentPhase: 'victory',
          roundHistory: [...(prev.roundHistory || []), roundEntry],
        };
      }
      else if (currentRound >= 3) {
        return {
          ...prev,
          accusedPlayerIndex: accusedIdx,
          winner: 'spy',
          currentPhase: 'victory',
          roundHistory: [...(prev.roundHistory || []), roundEntry],
        };
      }
      else {
        const nextRound = currentRound + 1;
        const nextQ = prev.questionPool?.[nextRound - 1] || fallbackQuestion;

        return {
          ...prev,
          accusedPlayerIndex: accusedIdx,
          currentRound: nextRound,
          currentQuestion: nextQ,
          currentPhase: 'question',
          playerAnswers: {},
          playerVotes: {},
          timerSeconds: 45,
          roundHistory: [...(prev.roundHistory || []), roundEntry],
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
        background: 'linear-gradient(180deg, rgba(6,11,26,0.95) 0%, rgba(6,11,26,0) 100%)',
        zIndex: 100,
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield color="#3b82f6" size={24} />
          <span style={{ fontFamily: 'Orbitron', fontWeight: 900, color: '#3b82f6', fontSize: '1.2rem', letterSpacing: '1.5px' }}>
            INTRUDER CHECK
          </span>
          <span style={{ fontSize: '0.7rem', background: '#3b82f6', color: '#000000', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontFamily: 'Orbitron', marginLeft: '8px' }}>
            v1.0.30
          </span>
          {gameState && (
            <span className="badge-agent" style={{ marginLeft: '10px', background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', color: '#3b82f6' }}>
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
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#3b82f6',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} color="#f59e0b" /> PURGE CACHE & RELOAD
          </button>

          {gameState && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#06b6d4', fontFamily: 'Rajdhani', fontWeight: 700 }}>
              <Radio color="#3b82f6" size={16} /> MODE: {gameState.mode.toUpperCase()}
            </div>
          )}

          <button
            onClick={toggleMute}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: audioMuted ? '#f59e0b' : '#3b82f6',
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
