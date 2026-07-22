import React, { useState, useEffect, useRef } from 'react';

/**
 * QuestionHUD Component
 * In-Round Question Console and Laser Selection HUD
 * 
 * Props:
 * - gameState: { question, options, timeRemaining, totalTime, isPassAndPlay, mode, ... }
 * - activePlayer: { name, role, isSpy, isIntruder, selectedOption, isConfirmed, ... }
 * - onSelectOption: (optionIndex) => void
 * - onConfirmAnswer: () => void
 */

// Web Audio API Synthesizer for zero-dependency sound effects
const playSoundEffect = (type) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'select') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'confirm') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.15);
      
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(1760, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.18);
    } else if (type === 'reveal') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // Audio Context might be restricted before user gesture
  }
};

export function QuestionHUD({ gameState = {}, activePlayer = {}, onSelectOption, onConfirmAnswer }) {
  // Check if Pass & Play Privacy Guard should be enabled
  const isPassAndPlay = Boolean(
    gameState?.isPassAndPlay ||
    gameState?.mode === 'passAndPlay' ||
    gameState?.mode === 'pass_and_play' ||
    activePlayer?.isPassAndPlay
  );

  const [isShieldActive, setIsShieldActive] = useState(isPassAndPlay);
  const [selectedIdx, setSelectedIdx] = useState(activePlayer?.selectedOption ?? gameState?.selectedOption ?? null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isConfirmedLocal, setIsConfirmedLocal] = useState(activePlayer?.isConfirmed || gameState?.isAnswerConfirmed || false);

  // Sync props state updates
  useEffect(() => {
    if (activePlayer?.selectedOption !== undefined) {
      setSelectedIdx(activePlayer.selectedOption);
    }
  }, [activePlayer?.selectedOption]);

  useEffect(() => {
    if (activePlayer?.isConfirmed !== undefined) {
      setIsConfirmedLocal(activePlayer.isConfirmed);
    }
  }, [activePlayer?.isConfirmed]);

  // Reset shield when active player changes in pass & play mode
  const currentPlayerId = activePlayer?.id || activePlayer?.name;
  const prevPlayerIdRef = useRef(currentPlayerId);

  useEffect(() => {
    if (prevPlayerIdRef.current !== currentPlayerId) {
      prevPlayerIdRef.current = currentPlayerId;
      if (isPassAndPlay) {
        setIsShieldActive(true);
      }
      setSelectedIdx(activePlayer?.selectedOption ?? null);
      setIsConfirmedLocal(activePlayer?.isConfirmed ?? false);
    }
  }, [currentPlayerId, isPassAndPlay, activePlayer]);

  // Role detection
  const isSpyOrIntruder = Boolean(
    activePlayer?.isSpy ||
    activePlayer?.isIntruder ||
    activePlayer?.role === 'spy' ||
    activePlayer?.role === 'intruder' ||
    activePlayer?.role === 'SPY' ||
    activePlayer?.role === 'INTRUDER' ||
    (gameState?.spyIndex !== undefined && gameState?.spyIndex !== null && gameState.players?.findIndex(p => p.id === activePlayer?.id || p.name === activePlayer?.name) === gameState.spyIndex)
  );

  // Default parameters
  const playerName = activePlayer?.name || 'AGENT';
  const questionObj = gameState?.currentQuestion || gameState?.question;
  const questionPrompt = typeof questionObj === 'object' ? (questionObj?.question || questionObj?.text) : questionObj;
  const rawOptions = (typeof questionObj === 'object' ? questionObj?.options : gameState?.options) || [];

  // Timer parameters
  const timeRemaining = typeof gameState?.timeRemaining === 'number' ? gameState.timeRemaining : (gameState?.timeLeft ?? 30);
  const totalTime = gameState?.totalTime || 30;
  const timePercent = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
  const isLowTime = timeRemaining <= 10;

  // Option selection handler
  const handleSelect = (idx) => {
    if (isConfirmedLocal) return;
    setSelectedIdx(idx);
    playSoundEffect('select');
    if (onSelectOption) {
      onSelectOption(idx);
    }
  };

  // Lock-in confirmation handler
  const handleLockIn = () => {
    if (selectedIdx === null || isConfirmedLocal) return;
    setIsConfirmedLocal(true);
    playSoundEffect('confirm');
    if (onConfirmAnswer) {
      onConfirmAnswer(selectedIdx);
    }
  };

  // Unlock privacy shield
  const handleRevealScreen = () => {
    playSoundEffect('reveal');
    setIsShieldActive(false);
  };

  // Format digital countdown string
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="qhud-container">
      {/* Component Stylesheet */}
      <style>{`
        .qhud-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
          background: rgba(10, 15, 26, 0.92);
          border: 1px solid rgba(0, 240, 255, 0.3);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.15);
          border-radius: 16px;
          backdrop-filter: blur(16px);
          color: #e0f2fe;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* Scanlines Overlay */
        .qhud-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0) 0px,
            rgba(0, 0, 0, 0) 2px,
            rgba(0, 240, 255, 0.03) 3px,
            rgba(0, 240, 255, 0.03) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Pass & Play Privacy Shield Screen */
        .qhud-privacy-shield {
          position: absolute;
          inset: 0;
          z-index: 50;
          background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          text-align: center;
          animation: qhud-fadeIn 0.3s ease-out;
        }

        .qhud-shield-icon {
          width: 72px;
          height: 72px;
          margin-bottom: 20px;
          color: #ff2a5f;
          filter: drop-shadow(0 0 16px rgba(255, 42, 95, 0.6));
          animation: qhud-pulse 2s infinite ease-in-out;
        }

        .qhud-shield-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #ff2a5f;
          margin-bottom: 12px;
          text-shadow: 0 0 10px rgba(255, 42, 95, 0.5);
        }

        .qhud-shield-desc {
          font-size: 15px;
          color: #94a3b8;
          max-width: 480px;
          margin-bottom: 28px;
          line-height: 1.5;
        }

        .qhud-shield-player {
          color: #00f0ff;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
        }

        .qhud-reveal-btn {
          position: relative;
          background: linear-gradient(135deg, #00f0ff 0%, #0077ff 100%);
          color: #020617;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 2px;
          padding: 14px 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
          text-transform: uppercase;
        }

        .qhud-reveal-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 30px rgba(0, 240, 255, 0.7);
          background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%);
        }

        /* Top Bar & Timer */
        .qhud-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .qhud-player-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qhud-player-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00f0ff, #7000ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #fff;
          font-size: 18px;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        }

        .qhud-player-name {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        /* Countdown Ring UI */
        .qhud-timer-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qhud-timer-ring-container {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .qhud-timer-svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }

        .qhud-timer-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 6;
        }

        .qhud-timer-progress {
          fill: none;
          stroke-width: 6;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
        }

        .qhud-timer-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          font-family: monospace;
        }

        /* Role Badges */
        .qhud-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .qhud-role-agent {
          background: rgba(0, 240, 255, 0.12);
          border: 1px solid rgba(0, 240, 255, 0.6);
          color: #00f0ff;
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
        }

        .qhud-role-intruder {
          background: rgba(255, 42, 95, 0.15);
          border: 1px solid rgba(255, 42, 95, 0.7);
          color: #ff2a5f;
          box-shadow: 0 0 15px rgba(255, 42, 95, 0.3);
          animation: qhud-glitch-border 1.5s infinite alternate;
        }

        /* Question Box */
        .qhud-question-box {
          position: relative;
          z-index: 2;
          background: rgba(15, 23, 42, 0.8);
          border-left: 4px solid #00f0ff;
          border-radius: 0 12px 12px 0;
          padding: 20px 24px;
          margin-bottom: 28px;
        }

        .qhud-question-box.encrypted {
          border-left-color: #ff2a5f;
          background: rgba(30, 10, 20, 0.85);
        }

        .qhud-question-title {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.4;
          color: #ffffff;
        }

        .qhud-encrypted-prompt {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ff2a5f;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .qhud-encrypted-subtext {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 6px;
        }

        /* Option Grid */
        .qhud-options-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .qhud-option-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          overflow: hidden;
        }

        .qhud-option-card:hover {
          border-color: rgba(0, 240, 255, 0.6);
          background: rgba(0, 240, 255, 0.08);
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
        }

        .qhud-option-card.selected {
          border-color: #00f0ff;
          background: linear-gradient(90deg, rgba(0, 240, 255, 0.18) 0%, rgba(0, 119, 255, 0.12) 100%);
          box-shadow: 0 0 25px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0, 240, 255, 0.2);
        }

        .qhud-option-card.locked {
          cursor: not-allowed;
          opacity: 0.85;
        }

        /* Option Radio/Letter Badge */
        .qhud-option-badge {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          color: #94a3b8;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .qhud-option-card:hover .qhud-option-badge {
          border-color: #00f0ff;
          color: #00f0ff;
          background: rgba(0, 240, 255, 0.15);
        }

        .qhud-option-card.selected .qhud-option-badge {
          background: #00f0ff;
          color: #020617;
          border-color: #00f0ff;
          box-shadow: 0 0 12px rgba(0, 240, 255, 0.8);
        }

        .qhud-option-text {
          font-size: 16px;
          font-weight: 600;
          color: #f1f5f9;
          flex: 1;
        }

        /* Laser Pointer Reticle Overlay */
        .qhud-laser-reticle {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          border: 1px dashed rgba(255, 42, 95, 0.8);
          background: radial-gradient(circle at center, rgba(255, 42, 95, 0.08) 0%, transparent 70%);
          animation: qhud-reticle-pulse 1s infinite alternate;
        }

        .qhud-laser-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #ff2a5f;
          border-radius: 50%;
          box-shadow: 0 0 10px #ff2a5f, 0 0 20px #ff2a5f;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          animation: qhud-laser-ping 0.8s infinite;
        }

        .qhud-laser-target-ring {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border: 1.5px solid #ff2a5f;
          border-radius: 50%;
          animation: qhud-spin 3s linear infinite;
        }

        /* Bottom Controls */
        .qhud-footer {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .qhud-status-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #94a3b8;
        }

        .qhud-confirm-btn {
          background: linear-gradient(135deg, #00f0ff 0%, #0077ff 100%);
          color: #020617;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1.5px;
          padding: 14px 36px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qhud-confirm-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 240, 255, 0.6);
        }

        .qhud-confirm-btn:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
          box-shadow: none;
        }

        .qhud-confirm-btn.confirmed {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        /* Keyframe Animations */
        @keyframes qhud-fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes qhud-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }

        @keyframes qhud-spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }

        @keyframes qhud-reticle-pulse {
          0% { border-color: rgba(255, 42, 95, 0.5); }
          100% { border-color: rgba(255, 42, 95, 1); }
        }

        @keyframes qhud-laser-ping {
          0% { transform: translateY(-50%) scale(1); opacity: 1; }
          50% { transform: translateY(-50%) scale(1.4); opacity: 0.6; }
          100% { transform: translateY(-50%) scale(1); opacity: 1; }
        }

        @keyframes qhud-glitch-border {
          0% { box-shadow: 0 0 10px rgba(255, 42, 95, 0.3); }
          100% { box-shadow: 0 0 22px rgba(255, 42, 95, 0.7); }
        }
      `}</style>

      {/* Pass & Play Privacy Shield Overlay */}
      {isShieldActive && (
        <div className="qhud-privacy-shield" data-testid="privacy-shield">
          <svg className="qhud-shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" strokeLinecap="round" />
            <circle cx="12" cy="15" r="1" fill="currentColor" />
          </svg>
          <div className="qhud-shield-title">SECURITY SHIELD ACTIVE</div>
          <div className="qhud-shield-desc">
            Pass & Play Privacy Enforcement Enabled.<br />
            Hand device to <span className="qhud-shield-player">{playerName}</span> before unlocking security terminal.
          </div>
          <button className="qhud-reveal-btn" onClick={handleRevealScreen} data-testid="reveal-screen-btn">
            Click to reveal screen for [{playerName}]
          </button>
        </div>
      )}

      {/* Top Header: Player Info & Countdown Timer Ring */}
      <div className="qhud-header">
        <div className="qhud-player-info">
          <div className="qhud-player-avatar">
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="qhud-player-name">{playerName}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>OPERATIVE TERMINAL</div>
          </div>
        </div>

        {/* Countdown Timer Progress Ring */}
        <div className="qhud-timer-wrap">
          <div className="qhud-timer-ring-container">
            <svg className="qhud-timer-svg" viewBox="0 0 44 44">
              <circle className="qhud-timer-bg" cx="22" cy="22" r="18" />
              <circle
                className="qhud-timer-progress"
                cx="22"
                cy="22"
                r="18"
                style={{
                  strokeDasharray: '113.097',
                  strokeDashoffset: `${113.097 * (1 - timePercent / 100)}`,
                  stroke: isLowTime ? '#ff2a5f' : timeRemaining <= 15 ? '#ffb700' : '#00f0ff'
                }}
              />
            </svg>
            <div className="qhud-timer-text" style={{ color: isLowTime ? '#ff2a5f' : '#ffffff' }}>
              {timeRemaining}s
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px' }}>TIME REMAINING</div>
            <div style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', color: isLowTime ? '#ff2a5f' : '#00f0ff' }}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>

      {/* Role Confidential Badge */}
      <div>
        {!isSpyOrIntruder ? (
          <div className="qhud-role-badge qhud-role-agent" data-testid="role-badge-agent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            AGENT - SECURITY QUESTION ASSIGNED
          </div>
        ) : (
          <div className="qhud-role-badge qhud-role-intruder" data-testid="role-badge-intruder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            INTRUDER ALERT - QUESTION CLASSIFIED! INFER FROM CHOICES
          </div>
        )}
      </div>

      {/* Security Question Prompt Console */}
      <div className={`qhud-question-box ${isSpyOrIntruder ? 'encrypted' : ''}`}>
        {!isSpyOrIntruder ? (
          <div className="qhud-question-title" data-testid="question-text">
            {questionPrompt}
          </div>
        ) : (
          <div>
            <div className="qhud-encrypted-prompt" data-testid="encrypted-prompt">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              WARNING: SECURITY PROMPT ENCRYPTED
            </div>
            <div className="qhud-encrypted-subtext">
              Decryption key absent. Analyze options below carefully to deduce the objective and blend in with operative choices.
            </div>
          </div>
        )}
      </div>

      {/* Options Grid with Laser Pointer Reticle UI */}
      <div className="qhud-options-grid" data-testid="options-grid">
        {rawOptions.map((optionText, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isSelected = selectedIdx === idx;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className={`qhud-option-card ${isSelected ? 'selected' : ''} ${isConfirmedLocal ? 'locked' : ''}`}
              onClick={() => handleSelect(idx)}
              onMouseEnter={() => {
                setHoveredIdx(idx);
                if (!isConfirmedLocal) playSoundEffect('hover');
              }}
              onMouseLeave={() => setHoveredIdx(null)}
              data-testid={`option-card-${idx}`}
            >
              <div className="qhud-option-badge">
                {letter}
              </div>
              <div className="qhud-option-text">
                {optionText}
              </div>

              {/* Laser Target Reticle Overlay on Hover */}
              {isHovered && !isConfirmedLocal && (
                <div className="qhud-laser-reticle">
                  <div className="qhud-laser-target-ring" />
                  <div className="qhud-laser-dot" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer & Lock-In Action */}
      <div className="qhud-footer">
        <div className="qhud-status-notice">
          {isConfirmedLocal ? (
            <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              ANSWER TRANSMITTED - CHOICE LOCKED IN
            </span>
          ) : selectedIdx !== null ? (
            <span style={{ color: '#00f0ff' }}>
              Option [{String.fromCharCode(65 + selectedIdx)}] Selected. Press Lock-In to transmit.
            </span>
          ) : (
            <span>Select an option to enable lock-in transmission.</span>
          )}
        </div>

        <button
          className={`qhud-confirm-btn ${isConfirmedLocal ? 'confirmed' : ''}`}
          onClick={handleLockIn}
          disabled={selectedIdx === null || isConfirmedLocal}
          data-testid="lock-in-btn"
        >
          {isConfirmedLocal ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              LOCKED IN
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              LOCK-IN ANSWER
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default QuestionHUD;
