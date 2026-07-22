import React, { useState, useEffect, useRef } from 'react';

/**
 * QuestionHUD Component
 * High-Density Cyber Terminal UI designed for 16:9 / 16:10 PC Computer Monitor Screens
 * 
 * Features:
 * - PC Monitor Bezel & Frame styling with hardware status LEDs and scanlines
 * - Screen Header: Station ID, Operative Callsign, System Clock, Power Meter & Timer Ring
 * - Secret Question Box: Terminal prompt styling (`OPERATIVE_PROMPT >`) with role encryption support
 * - 4 Cyber Option Buttons with physical Keyboard Shortcut Listeners (A, B, C, D / 1, 2, 3, 4)
 * - Lock-in Transmission Button with terminal sound trigger & glowing confirm state
 * - Web Audio API procedural sound synthesizer for zero-dependency sound FX
 * - Full Pass & Play Privacy Shield support
 * 
 * Props:
 * - gameState: { question, currentQuestion, options, timeRemaining, totalTime, isPassAndPlay, mode, spyIndex, players, selectedOption, isAnswerConfirmed, activePlayerIndex }
 * - activePlayer: { id, name, role, isSpy, isIntruder, selectedOption, isConfirmed }
 * - onSelectOption: (optionIndex) => void
 * - onConfirmAnswer: (optionIndex) => void
 */

// Procedural Web Audio API Sound Synthesizer
const playSoundEffect = (type) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'select' || type === 'key') {
      // Tactile key press / option selection blip
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(1040, now + 0.07);
      osc2.frequency.setValueAtTime(1040, now);
      osc2.frequency.exponentialRampToValueAtTime(2080, now + 0.07);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.07);
    } else if (type === 'confirm') {
      // Multi-tone terminal lock-in burst
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      sub.type = 'sine';
      
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.linearRampToValueAtTime(880, now + 0.16);
      
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.linearRampToValueAtTime(1760, now + 0.16);

      sub.frequency.setValueAtTime(120, now);
      sub.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      osc1.connect(gain);
      osc2.connect(gain);
      sub.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      sub.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
      sub.stop(now + 0.22);
    } else if (type === 'reveal') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.18);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch (e) {
    // Audio Context restricted before user gesture
  }
};

export function QuestionHUD({ gameState = {}, activePlayer = {}, onSelectOption, onConfirmAnswer }) {
  // Pass & Play Privacy Shield state
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

  // System Live Clock state
  const [sysClock, setSysClock] = useState(() => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  });

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const d = new Date();
      setSysClock(d.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

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

  // Default parameters & derived details
  const playerName = activePlayer?.name || 'OPERATIVE';
  const stationIdNum = (gameState?.activePlayerIndex !== undefined ? gameState.activePlayerIndex + 1 : 1).toString().padStart(2, '0');
  const stationId = `TRM-${stationIdNum}`;
  const callsign = playerName.toUpperCase();

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
    if (isConfirmedLocal || isShieldActive) return;
    if (idx < 0 || idx >= rawOptions.length) return;
    setSelectedIdx(idx);
    playSoundEffect('select');
    if (onSelectOption) {
      onSelectOption(idx);
    }
  };

  // Lock-in confirmation handler
  const handleLockIn = () => {
    if (selectedIdx === null || isConfirmedLocal || isShieldActive) return;
    setIsConfirmedLocal(true);
    playSoundEffect('confirm');
    if (onConfirmAnswer) {
      onConfirmAnswer(selectedIdx);
    }
  };

  // Physical Keyboard Shortcut Listener (A, B, C, D / 1, 2, 3, 4 / Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not trigger if privacy shield active, answer confirmed, or inside text input
      if (isShieldActive || isConfirmedLocal) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      const key = e.key.toUpperCase();

      if (key === 'A' || key === '1') {
        if (rawOptions.length > 0) handleSelect(0);
      } else if (key === 'B' || key === '2') {
        if (rawOptions.length > 1) handleSelect(1);
      } else if (key === 'C' || key === '3') {
        if (rawOptions.length > 2) handleSelect(2);
      } else if (key === 'D' || key === '4') {
        if (rawOptions.length > 3) handleSelect(3);
      } else if (key === 'ENTER' || key === ' ') {
        if (selectedIdx !== null && !isConfirmedLocal) {
          e.preventDefault();
          handleLockIn();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShieldActive, isConfirmedLocal, selectedIdx, rawOptions.length]);

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
    <div className="qhud-monitor-wrapper">
      {/* CSS Stylesheet for High-Density 16:9 PC Computer Monitor Screen Frame */}
      <style>{`
        .qhud-monitor-wrapper {
          position: relative;
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* 3D PC Computer Monitor Frame / Bezel */
        .qhud-pc-bezel {
          position: relative;
          background: #0b0f19;
          border: 12px solid #1e293b;
          border-radius: 16px;
          box-shadow: 
            0 0 0 2px #0f172a,
            0 20px 50px rgba(0, 0, 0, 0.85),
            0 0 40px rgba(0, 240, 255, 0.12),
            inset 0 0 15px rgba(0, 0, 0, 0.9);
          padding: 16px 20px;
          color: #e0f2fe;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        /* Hardware Top Bezel Bar with Model & LEDs */
        .qhud-bezel-hardware {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 10px 12px 10px;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(0, 240, 255, 0.2);
          font-size: 11px;
          letter-spacing: 1.5px;
          color: #64748b;
          text-transform: uppercase;
          user-select: none;
        }

        .qhud-bezel-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #38bdf8;
          font-weight: 700;
        }

        .qhud-bezel-leds {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qhud-led-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #94a3b8;
        }

        .qhud-led-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .qhud-led-power {
          background: #00f0ff;
          box-shadow: 0 0 8px #00f0ff, 0 0 12px #00f0ff;
          animation: qhud-led-glow 2s infinite ease-in-out;
        }

        .qhud-led-data {
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          animation: qhud-led-blink 1.2s infinite steps(2, start);
        }

        /* Monitor Screen CRT / Glare Overlay */
        .qhud-screen-inner {
          position: relative;
          background: radial-gradient(circle at 50% 30%, #0d1527 0%, #050811 100%);
          border: 1px solid rgba(0, 240, 255, 0.25);
          border-radius: 8px;
          padding: 20px 24px;
          overflow: hidden;
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8);
        }

        /* Scanlines Overlay */
        .qhud-screen-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0) 0px,
            rgba(0, 0, 0, 0) 2px,
            rgba(0, 240, 255, 0.025) 3px,
            rgba(0, 240, 255, 0.025) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Screen Header Bar */
        .qhud-header-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px dashed rgba(0, 240, 255, 0.2);
        }

        .qhud-sys-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .qhud-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #94a3b8;
          letter-spacing: 1px;
        }

        .qhud-meta-val {
          color: #00f0ff;
          font-weight: 700;
        }

        .qhud-power-meter {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #38bdf8;
          margin-top: 2px;
        }

        .qhud-power-bar-wrap {
          display: flex;
          gap: 3px;
        }

        .qhud-power-pip {
          width: 8px;
          height: 10px;
          background: #00f0ff;
          border-radius: 1px;
          box-shadow: 0 0 6px rgba(0, 240, 255, 0.6);
        }

        .qhud-power-pip.dim {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: none;
        }

        /* Countdown Ring UI */
        .qhud-timer-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .qhud-timer-ring-container {
          position: relative;
          width: 54px;
          height: 54px;
        }

        .qhud-timer-svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }

        .qhud-timer-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.08);
          stroke-width: 5;
        }

        .qhud-timer-progress {
          fill: none;
          stroke-width: 5;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
        }

        .qhud-timer-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          font-family: monospace;
        }

        .qhud-header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          text-align: right;
        }

        .qhud-clock-val {
          font-size: 13px;
          font-weight: 700;
          color: #00ff66;
          letter-spacing: 1px;
          text-shadow: 0 0 8px rgba(0, 255, 102, 0.4);
        }

        /* Role Badges */
        .qhud-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .qhud-role-agent {
          background: rgba(0, 240, 255, 0.1);
          border: 1px solid rgba(0, 240, 255, 0.5);
          color: #00f0ff;
          box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
        }

        .qhud-role-intruder {
          background: rgba(255, 42, 95, 0.15);
          border: 1px solid rgba(255, 42, 95, 0.7);
          color: #ff2a5f;
          box-shadow: 0 0 15px rgba(255, 42, 95, 0.3);
          animation: qhud-glitch-border 1.5s infinite alternate;
        }

        /* Secret Question Terminal Prompt Box */
        .qhud-question-box {
          position: relative;
          z-index: 2;
          background: rgba(10, 18, 34, 0.85);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-left: 4px solid #00f0ff;
          border-radius: 4px;
          padding: 16px 20px;
          margin-bottom: 20px;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6);
        }

        .qhud-question-box.encrypted {
          border-left-color: #ff2a5f;
          border-color: rgba(255, 42, 95, 0.4);
          background: rgba(24, 10, 20, 0.9);
        }

        .qhud-terminal-prompt-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #00f0ff;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .qhud-question-box.encrypted .qhud-terminal-prompt-header {
          color: #ff2a5f;
        }

        .qhud-cursor {
          display: inline-block;
          width: 8px;
          height: 14px;
          background: #00f0ff;
          margin-left: 4px;
          vertical-align: middle;
          animation: qhud-blink 1s infinite steps(2, start);
        }

        .qhud-question-box.encrypted .qhud-cursor {
          background: #ff2a5f;
        }

        .qhud-question-title {
          font-size: 17px;
          font-weight: 700;
          line-height: 1.45;
          color: #ffffff;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .qhud-encrypted-prompt {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ff2a5f;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .qhud-encrypted-subtext {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 6px;
          line-height: 1.4;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* 4 Cyber Option Buttons Grid */
        .qhud-options-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (max-width: 640px) {
          .qhud-options-grid {
            grid-template-columns: 1fr;
          }
        }

        .qhud-option-card {
          position: relative;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 6px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          overflow: hidden;
        }

        .qhud-option-card:hover {
          border-color: rgba(0, 240, 255, 0.7);
          background: rgba(0, 240, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 0 16px rgba(0, 240, 255, 0.25);
        }

        .qhud-option-card.selected {
          border-color: #00f0ff;
          background: linear-gradient(90deg, rgba(0, 240, 255, 0.22) 0%, rgba(0, 119, 255, 0.15) 100%);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 8px rgba(0, 240, 255, 0.25);
        }

        .qhud-option-card.locked {
          cursor: not-allowed;
          opacity: 0.85;
        }

        /* Option Letter Badge & Keyboard Tag */
        .qhud-option-badge-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .qhud-option-badge {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(0, 240, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          color: #38bdf8;
          transition: all 0.15s ease;
        }

        .qhud-option-card:hover .qhud-option-badge {
          border-color: #00f0ff;
          color: #00f0ff;
          background: rgba(0, 240, 255, 0.2);
        }

        .qhud-option-card.selected .qhud-option-badge {
          background: #00f0ff;
          color: #020617;
          border-color: #00f0ff;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
        }

        .qhud-key-tag {
          font-size: 9px;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .qhud-option-card:hover .qhud-key-tag,
        .qhud-option-card.selected .qhud-key-tag {
          color: #00f0ff;
        }

        .qhud-option-text {
          font-size: 14px;
          font-weight: 600;
          color: #f1f5f9;
          flex: 1;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* Laser Reticle Overlay */
        .qhud-laser-reticle {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 14px;
          border: 1px dashed rgba(0, 240, 255, 0.8);
          background: radial-gradient(circle at center, rgba(0, 240, 255, 0.06) 0%, transparent 70%);
        }

        .qhud-laser-dot {
          width: 8px;
          height: 8px;
          background: #00f0ff;
          border-radius: 50%;
          box-shadow: 0 0 10px #00f0ff, 0 0 15px #00f0ff;
          animation: qhud-laser-ping 0.8s infinite;
        }

        /* Footer & Lock-In Transmission Controls */
        .qhud-footer {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-top: 8px;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .qhud-status-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
        }

        .qhud-confirm-btn {
          background: linear-gradient(135deg, #00f0ff 0%, #0077ff 100%);
          color: #020617;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          padding: 12px 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 16px rgba(0, 240, 255, 0.35);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
        }

        .qhud-confirm-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(0, 240, 255, 0.65);
        }

        .qhud-confirm-btn:disabled {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
          box-shadow: none;
        }

        .qhud-confirm-btn.confirmed {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
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
          padding: 24px;
          text-align: center;
          animation: qhud-fadeIn 0.3s ease-out;
        }

        .qhud-shield-icon {
          width: 60px;
          height: 60px;
          margin-bottom: 16px;
          color: #ff2a5f;
          filter: drop-shadow(0 0 16px rgba(255, 42, 95, 0.6));
          animation: qhud-pulse 2s infinite ease-in-out;
        }

        .qhud-shield-title {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 2.5px;
          color: #ff2a5f;
          margin-bottom: 10px;
          text-shadow: 0 0 10px rgba(255, 42, 95, 0.5);
        }

        .qhud-shield-desc {
          font-size: 14px;
          color: #94a3b8;
          max-width: 440px;
          margin-bottom: 24px;
          line-height: 1.5;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .qhud-shield-player {
          color: #00f0ff;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
        }

        .qhud-reveal-btn {
          background: linear-gradient(135deg, #00f0ff 0%, #0077ff 100%);
          color: #020617;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          padding: 12px 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
          text-transform: uppercase;
          font-family: inherit;
        }

        .qhud-reveal-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 30px rgba(0, 240, 255, 0.7);
          background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%);
        }

        /* Animations */
        @keyframes qhud-fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes qhud-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }

        @keyframes qhud-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes qhud-led-glow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px #00f0ff); }
          50% { opacity: 0.5; filter: drop-shadow(0 0 1px #00f0ff); }
        }

        @keyframes qhud-led-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        @keyframes qhud-laser-ping {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes qhud-glitch-border {
          0% { box-shadow: 0 0 10px rgba(255, 42, 95, 0.3); }
          100% { box-shadow: 0 0 22px rgba(255, 42, 95, 0.7); }
        }
      `}</style>

      {/* PC Computer Monitor Hardware Outer Chassis */}
      <div className="qhud-pc-bezel">

        {/* Bezel Hardware Bar (Model, Power & Network Status LEDs) */}
        <div className="qhud-bezel-hardware">
          <div className="qhud-bezel-brand">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>CYBER-MONITOR 24-HD // SYS-OS v4.09</span>
          </div>
          <div className="qhud-bezel-leds">
            <div className="qhud-led-item">
              <div className="qhud-led-dot qhud-led-power" />
              <span>PWR</span>
            </div>
            <div className="qhud-led-item">
              <div className="qhud-led-dot qhud-led-data" />
              <span>LINK</span>
            </div>
          </div>
        </div>

        {/* Inner Monitor Display Screen */}
        <div className="qhud-screen-inner">

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
                Hand terminal to <span className="qhud-shield-player">{playerName}</span> before unlocking operative prompt.
              </div>
              <button className="qhud-reveal-btn" onClick={handleRevealScreen} data-testid="reveal-screen-btn">
                Click to reveal screen for [{playerName}]
              </button>
            </div>
          )}

          {/* Screen Top Bar Header: Station ID, Operative Callsign, System Clock, Power Meter & Timer */}
          <div className="qhud-header-grid">
            
            {/* Left: Station ID & Operative Callsign */}
            <div className="qhud-sys-meta">
              <div className="qhud-meta-row">
                <span>STATION ID:</span>
                <span className="qhud-meta-val">{stationId}</span>
              </div>
              <div className="qhud-meta-row">
                <span>CALLSIGN:</span>
                <span className="qhud-meta-val">{callsign}</span>
              </div>
              {/* Battery / Power Meter */}
              <div className="qhud-power-meter">
                <span>PWR: 98%</span>
                <div className="qhud-power-bar-wrap">
                  <div className="qhud-power-pip" />
                  <div className="qhud-power-pip" />
                  <div className="qhud-power-pip" />
                  <div className="qhud-power-pip" />
                  <div className="qhud-power-pip dim" />
                </div>
              </div>
            </div>

            {/* Center: Countdown Timer Progress Ring */}
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
            </div>

            {/* Right: Real-time System Clock */}
            <div className="qhud-header-right">
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px' }}>SYS CLOCK</div>
              <div className="qhud-clock-val">{sysClock}</div>
              <div style={{ fontSize: '10px', color: isLowTime ? '#ff2a5f' : '#00f0ff', letterSpacing: '1px' }}>
                {formatTime(timeRemaining)} REMAINING
              </div>
            </div>
          </div>

          {/* Role Confidential Badge */}
          <div>
            {!isSpyOrIntruder ? (
              <div className="qhud-role-badge qhud-role-agent" data-testid="role-badge-agent">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                AGENT - SECURITY QUESTION ASSIGNED
              </div>
            ) : (
              <div className="qhud-role-badge qhud-role-intruder" data-testid="role-badge-intruder">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                INTRUDER ALERT - QUESTION CLASSIFIED! INFER FROM CHOICES
              </div>
            )}
          </div>

          {/* Secret Question Terminal Prompt Box */}
          <div className={`qhud-question-box ${isSpyOrIntruder ? 'encrypted' : ''}`}>
            <div className="qhud-terminal-prompt-header">
              <span>OPERATIVE_PROMPT &gt;</span>
              <span className="qhud-cursor" />
            </div>

            {!isSpyOrIntruder ? (
              <div className="qhud-question-title" data-testid="question-text">
                {questionPrompt}
              </div>
            ) : (
              <div>
                <div className="qhud-encrypted-prompt" data-testid="encrypted-prompt">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  SECURITY PROMPT ENCRYPTED
                </div>
                <div className="qhud-encrypted-subtext">
                  Decryption key absent. Analyze choices below to deduce objective and blend in with operative transmissions.
                </div>
              </div>
            )}
          </div>

          {/* 4 Cyber Option Buttons Grid */}
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
                    if (!isConfirmedLocal && !isShieldActive) playSoundEffect('hover');
                  }}
                  onMouseLeave={() => setHoveredIdx(null)}
                  data-testid={`option-card-${idx}`}
                >
                  <div className="qhud-option-badge-wrap">
                    <div className="qhud-option-badge">
                      {letter}
                    </div>
                    <span className="qhud-key-tag">[{letter}]</span>
                  </div>

                  <div className="qhud-option-text">
                    {optionText}
                  </div>

                  {/* Laser Reticle Overlay on Hover */}
                  {isHovered && !isConfirmedLocal && !isShieldActive && (
                    <div className="qhud-laser-reticle">
                      <div className="qhud-laser-dot" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer & Lock-In Transmission Controls */}
          <div className="qhud-footer">
            <div className="qhud-status-notice">
              {isConfirmedLocal ? (
                <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  TRANSMITTED - CHOICE LOCKED IN
                </span>
              ) : selectedIdx !== null ? (
                <span style={{ color: '#00f0ff' }}>
                  Option [{String.fromCharCode(65 + selectedIdx)}] Selected. Press [ENTER] or Lock-In to transmit.
                </span>
              ) : (
                <span>Press [A, B, C, D] or click an option to select.</span>
              )}
            </div>

            <button
              className={`qhud-confirm-btn ${isConfirmedLocal ? 'confirmed' : ''}`}
              onClick={handleLockIn}
              disabled={selectedIdx === null || isConfirmedLocal || isShieldActive}
              data-testid="lock-in-btn"
            >
              {isConfirmedLocal ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  LOCKED IN
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  LOCK-IN ANSWER
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default QuestionHUD;
