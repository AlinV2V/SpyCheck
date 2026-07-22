import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Shield, Radio } from 'lucide-react';
import ControlRoomScene from './3d/ControlRoomScene';
import Lobby from './components/Lobby';
import QuestionHUD from './components/QuestionHUD';
import ComputerScreenTerminal from './components/ComputerScreenTerminal';
import DiscussionPhase from './components/DiscussionPhase';
import VotingPhase from './components/VotingPhase';
import VictoryModal from './components/VictoryModal';
import { createRoomState } from './services/roomState';
import { getRandomQuestions } from './data/questionBank';
import { selectBotAnswer } from './services/botAI';
import { setMuted, isMuted, playClick, playTimerTick } from './services/audio';
import './index.css';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [questionPool, setQuestionPool] = useState([]);
  const [audioMuted, setAudioMuted] = useState(isMuted());

  // Load default questions pool on mount
  useEffect(() => {
    const questions = getRandomQuestions(10);
    setQuestionPool(questions);
  }, []);

  // Universal Phase Timer Tick Effect
  useEffect(() => {
    let interval = null;
    if (gameState && gameState.timer > 0 && ['question', 'discussion'].includes(gameState.currentPhase)) {
      interval = setInterval(() => {
        setGameState(prev => {
          if (!prev) return null;
          const nextTimer = prev.timer - 1;

          if (nextTimer <= 5 && nextTimer > 0) {
            playTimerTick(nextTimer <= 3);
          }

          if (nextTimer <= 0) {
            // Timer expired auto-advance
            if (prev.currentPhase === 'question') {
              return autoAdvanceQuestionPhase(prev);
            } else if (prev.currentPhase === 'discussion') {
              return { ...prev, currentPhase: 'voting', timer: 0 };
            }
          }
          return { ...prev, timer: nextTimer };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Auto fill unsubmitted answers when question timer runs out
  const autoAdvanceQuestionPhase = (prevState) => {
    const updatedAnswers = { ...prevState.playerAnswers };
    prevState.players.forEach((_p, idx) => {
      if (!updatedAnswers[idx]) {
        updatedAnswers[idx] = prevState.currentQuestion.options[0];
      }
    });
    return {
      ...prevState,
      playerAnswers: updatedAnswers,
      currentPhase: 'discussion',
      timer: prevState.timerSeconds || 45,
    };
  };

  // Start new game session from Lobby settings
  const handleStartGame = (config) => {
    const questions = getRandomQuestions(5, config.players);
    const firstQ = questions[0];

    // Randomly assign Intruder / Spy role
    const spyIdx = Math.floor(Math.random() * config.players.length);

    const initialState = createRoomState({
      mode: config.mode,
      players: config.players,
      timerSeconds: config.timerSeconds,
      speechEnabled: config.speechEnabled,
      loliColliderEnabled: config.loliColliderEnabled,
      currentQuestion: firstQ,
      spyIndex: spyIdx,
      currentPhase: 'question',
      currentRound: 1,
    });

    setQuestionPool(questions);
    setGameState(initialState);
    setActivePlayerIndex(0);

    // Auto-select AI bot answers if in solo AI mode
    if (config.mode === 'solo_ai') {
      setTimeout(() => {
        config.players.forEach((p, idx) => {
          if (idx !== 0 && p.isBot) {
            const botChoice = selectBotAnswer({
              bot: p.botPersona,
              question: firstQ,
              options: firstQ.options,
              isSpy: idx === spyIdx,
            });
            setGameState(prev => ({
              ...prev,
              playerAnswers: {
                ...prev.playerAnswers,
                [idx]: botChoice
              }
            }));
          }
        });
      }, 500);
    }
  };

  // Option selection for active player
  const handleSelectOption = (option) => {
    if (!gameState) return;
    setGameState(prev => ({
      ...prev,
      playerAnswers: {
        ...prev.playerAnswers,
        [activePlayerIndex]: option,
      }
    }));
  };

  // Confirm answer for current active player
  const handleConfirmAnswer = (confirmedOptionIndex) => {
    playClick();
    if (!gameState) return;

    const currentAnswer = confirmedOptionIndex ?? gameState.playerAnswers?.[activePlayerIndex];
    if (currentAnswer === undefined || currentAnswer === null) {
      return;
    }

    const updatedAnswers = {
      ...gameState.playerAnswers,
      [activePlayerIndex]: currentAnswer
    };

    // If Pass & Play mode and not last human player, pass turn to next player
    if (gameState.mode === 'pass_play' && activePlayerIndex < gameState.players.length - 1) {
      setGameState(prev => ({ ...prev, playerAnswers: updatedAnswers }));
      setActivePlayerIndex(prev => prev + 1);
      return;
    }

    // Proceed to discussion phase
    setGameState(prev => ({
      ...prev,
      playerAnswers: updatedAnswers,
      currentPhase: 'discussion',
      timer: prev.timerSeconds || 45,
    }));
  };

  // Proceed to voting phase
  const handleProceedToVote = () => {
    playClick();
    setGameState(prev => ({
      ...prev,
      currentPhase: 'voting',
    }));
  };

  // Handle voting resolution and victory condition checks
  const handleProceedToResolution = ({ accusedIndex, isSpyCaught }) => {
    if (!gameState) return;

    const roundData = {
      round: gameState.currentRound,
      question: gameState.currentQuestion,
      spyChoice: gameState.playerAnswers[gameState.spyIndex],
      accusedIndex,
      isSpyCaught,
    };

    const newHistory = [...(gameState.roundHistory || []), roundData];

    // Win Check logic:
    // 1. If Intruder is caught -> Agents Win!
    // 2. If Round 3 finished and Intruder survived -> Intruder / Spy Wins!
    if (isSpyCaught) {
      setGameState(prev => ({
        ...prev,
        winner: 'agents',
        currentPhase: 'victory',
        roundHistory: newHistory,
      }));
    } else if (gameState.currentRound >= 3) {
      setGameState(prev => ({
        ...prev,
        winner: 'spy',
        currentPhase: 'victory',
        roundHistory: newHistory,
      }));
    } else {
      // Advance to Next Round!
      const nextRound = gameState.currentRound + 1;
      const nextQ = questionPool[nextRound - 1] || getRandomQuestions(1)[0];

      setGameState(prev => ({
        ...prev,
        currentRound: nextRound,
        currentPhase: 'question',
        currentQuestion: nextQ,
        playerAnswers: {},
        playerVotes: {},
        timer: prev.timerSeconds || 45,
        roundHistory: newHistory,
      }));
      setActivePlayerIndex(0);

      // Auto generate bot answers for next round in solo AI mode
      if (gameState.mode === 'solo_ai') {
        setTimeout(() => {
          gameState.players.forEach((p, idx) => {
            if (idx !== 0 && p.isBot) {
              const botChoice = selectBotAnswer({
                bot: p.botPersona,
                question: nextQ,
                options: nextQ.options,
                isSpy: idx === gameState.spyIndex,
              });
              setGameState(curr => ({
                ...curr,
                playerAnswers: { ...curr.playerAnswers, [idx]: botChoice }
              }));
            }
          });
        }, 500);
      }
    }
  };

  // Rematch with same player configuration
  const handleRematch = () => {
    if (!gameState) return;
    handleStartGame({
      mode: gameState.mode,
      players: gameState.players,
      timerSeconds: gameState.timerSeconds,
      speechEnabled: gameState.speechEnabled,
      loliColliderEnabled: gameState.loliColliderEnabled,
    });
  };

  // Return to main lobby
  const handleReturnToLobby = () => {
    setGameState(null);
  };

  // Toggle global audio mute state
  const toggleMute = () => {
    const nextMuted = !audioMuted;
    setAudioMuted(nextMuted);
    setMuted(nextMuted);
  };

  const activePlayer = gameState?.players ? {
    ...gameState.players[activePlayerIndex],
    isSpy: activePlayerIndex === gameState.spyIndex,
    selectedOption: gameState.playerAnswers?.[activePlayerIndex]
  } : null;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0d14' }}>
      {/* 3D Command Room Background Scene */}
      <ControlRoomScene
        gameState={gameState}
        currentPhase={gameState?.winner ? 'victory' : (gameState?.currentPhase || 'lobby')}
        activePlayerIndex={activePlayerIndex}
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
        background: 'linear-gradient(180deg, rgba(10,13,20,0.95) 0%, rgba(10,13,20,0) 100%)',
        zIndex: 100,
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield color="#00f0ff" size={24} />
          <span style={{ fontFamily: 'Orbitron', fontWeight: 900, color: '#00f0ff', fontSize: '1.2rem', letterSpacing: '1.5px' }}>
            INTRUDER CHECK
          </span>
          {gameState && (
            <span className="badge-agent" style={{ marginLeft: '10px' }}>
              ROUND {gameState.currentRound} / 3
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {gameState && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'Rajdhani' }}>
              <Radio color="#00ffaa" size={16} /> MODE: {gameState.mode.toUpperCase()}
            </div>
          )}

          <button
            onClick={toggleMute}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: audioMuted ? '#ff0055' : '#00f0ff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Viewport Shell */}
      <main style={{
        position: 'absolute',
        top: '65px',
        left: 0,
        width: '100%',
        height: 'calc(100vh - 65px)',
        zIndex: 10,
        overflowY: 'auto',
        padding: '20px'
      }}>
        {!gameState ? (
          <Lobby onStartGame={handleStartGame} />
        ) : gameState.winner ? (
          <VictoryModal
            gameState={gameState}
            onRematch={handleRematch}
            onReturnToLobby={handleReturnToLobby}
          />
        ) : gameState.currentPhase === 'question' ? (
          <ComputerScreenTerminal
            activePlayer={activePlayer}
            activePlayerIndex={activePlayerIndex}
            onSelectOption={handleSelectOption}
            onConfirmAnswer={handleConfirmAnswer}
          >
            <QuestionHUD
              gameState={gameState}
              activePlayer={activePlayer}
              onSelectOption={handleSelectOption}
              onConfirmAnswer={handleConfirmAnswer}
            />
          </ComputerScreenTerminal>
        ) : gameState.currentPhase === 'discussion' ? (
          <DiscussionPhase
            gameState={gameState}
            onProceedToVote={handleProceedToVote}
          />
        ) : gameState.currentPhase === 'voting' ? (
          <VotingPhase
            gameState={gameState}
            onCastVote={() => {}}
            onProceedToResolution={handleProceedToResolution}
          />
        ) : null}
      </main>
    </div>
  );
}
