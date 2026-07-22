import React, { useEffect } from 'react';
import { Monitor, Terminal, Cpu, Keyboard, CornerDownLeft } from 'lucide-react';

/**
 * ComputerScreenTerminal Component
 * Wraps HUD components inside a 3D Sci-Fi PC / Laptop Monitor Terminal Frame
 * with CRT scanlines, status LEDs, operative metadata, and keyboard shortcut hints.
 *
 * Props:
 * - activePlayer: Object representing the currently active operative
 * - activePlayerIndex: Number (0-5)
 * - children: Wrapped content (e.g. QuestionHUD)
 * - onSelectOption: Optional callback for option selection (0, 1, 2, 3)
 * - onConfirmAnswer: Optional callback for locking in answer
 */
export function ComputerScreenTerminal({
  activePlayer = {},
  activePlayerIndex = 0,
  children,
  onSelectOption,
  onConfirmAnswer,
}) {
  const playerName = activePlayer?.name || `OPERATIVE 0${activePlayerIndex + 1}`;
  const isSpy = activePlayer?.isSpy;

  // Keyboard shortcut listener inside terminal wrapper
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keypresses if user is typing in an input field or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      const code = e.code;
      const key = e.key ? e.key.toUpperCase() : '';

      if (code === 'KeyA' || key === 'A') {
        onSelectOption?.(0);
      } else if (code === 'KeyB' || key === 'B') {
        onSelectOption?.(1);
      } else if (code === 'KeyC' || key === 'C') {
        onSelectOption?.(2);
      } else if (code === 'KeyD' || key === 'D') {
        onSelectOption?.(3);
      } else if (code === 'Enter' || code === 'Space' || key === 'ENTER' || key === ' ') {
        e.preventDefault();
        onConfirmAnswer?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectOption, onConfirmAnswer]);

  return (
    <div className="pc-terminal-outer">
      <style>{`
        .pc-terminal-outer {
          position: relative;
          width: 100%;
          max-width: 1040px;
          margin: 0 auto;
          padding: 12px;
          background: #080c14;
          border: 3px solid #1e293b;
          border-radius: 20px;
          box-shadow: 
            0 0 50px rgba(0, 0, 0, 0.9),
            0 0 30px rgba(0, 240, 255, 0.15),
            inset 0 0 15px rgba(0, 0, 0, 0.8);
          font-family: 'Rajdhani', 'Orbitron', sans-serif;
          box-sizing: border-box;
        }

        /* Monitor Bezel Header */
        .pc-terminal-bezel-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          border-radius: 12px 12px 0 0;
          border-bottom: 2px solid rgba(0, 240, 255, 0.3);
          color: #94a3b8;
          font-size: 0.85rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .pc-terminal-bezel-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          color: #00f0ff;
        }

        .pc-terminal-status-dots {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pc-led-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .pc-led-green {
          background: #00ffaa;
          box-shadow: 0 0 8px #00ffaa;
        }

        .pc-led-amber {
          background: #ffaa00;
          box-shadow: 0 0 8px #ffaa00;
          animation: pc-pulse 1.5s infinite;
        }

        .pc-led-red {
          background: #ff0055;
          box-shadow: 0 0 8px #ff0055;
          animation: pc-pulse 1s infinite;
        }

        /* Screen Display Container */
        .pc-terminal-screen {
          position: relative;
          background: radial-gradient(circle at center, #0b1220 0%, #04070d 100%);
          border: 2px solid rgba(0, 240, 255, 0.25);
          border-top: none;
          border-bottom: none;
          padding: 16px;
          overflow: hidden;
        }

        /* CRT Scanline Overlay Effect */
        .pc-terminal-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
          );
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 20;
          opacity: 0.6;
        }

        /* Corner Hardware Bracket Accents */
        .pc-corner-bracket {
          position: absolute;
          width: 16px;
          height: 16px;
          border-color: #00f0ff;
          border-style: solid;
          pointer-events: none;
          z-index: 25;
        }
        .pc-cb-tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
        .pc-cb-tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
        .pc-cb-bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
        .pc-cb-br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }

        /* Keyboard Hotkey Hints Footer Bar */
        .pc-terminal-keyboard-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding: 10px 18px;
          background: linear-gradient(180deg, #0f172a 0%, #090d16 100%);
          border-radius: 0 0 12px 12px;
          border-top: 2px solid rgba(0, 240, 255, 0.2);
          color: #e2e8f0;
          font-size: 0.85rem;
        }

        .pc-shortcut-group {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .pc-key-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 26px;
          height: 26px;
          padding: 0 6px;
          background: rgba(0, 240, 255, 0.15);
          border: 1px solid #00f0ff;
          border-radius: 4px;
          color: #00f0ff;
          font-family: 'Orbitron', monospace;
          font-weight: 800;
          font-size: 0.75rem;
          box-shadow: 0 0 6px rgba(0, 240, 255, 0.3);
        }

        .pc-key-badge-action {
          background: rgba(0, 255, 170, 0.15);
          border-color: #00ffaa;
          color: #00ffaa;
          box-shadow: 0 0 6px rgba(0, 255, 170, 0.3);
        }

        .pc-key-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
        }

        @keyframes pc-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Monitor Hardware Bezel Header */}
      <div className="pc-terminal-bezel-bar">
        <div className="pc-terminal-bezel-title">
          <Terminal size={18} color="#00f0ff" />
          <span>STATION 0{activePlayerIndex + 1} // OPERATIVE: {playerName.toUpperCase()}</span>
        </div>
        <div className="pc-terminal-status-dots">
          <Cpu size={16} color="#94a3b8" />
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginRight: '6px' }}>SYS.ONLINE</span>
          <div className={`pc-led-dot ${isSpy ? 'pc-led-red' : 'pc-led-green'}`} />
          <div className="pc-led-dot pc-led-amber" />
        </div>
      </div>

      {/* CRT Screen Frame Wrapping Children */}
      <div className="pc-terminal-screen">
        <div className="pc-corner-bracket pc-cb-tl" />
        <div className="pc-corner-bracket pc-cb-tr" />
        <div className="pc-corner-bracket pc-cb-bl" />
        <div className="pc-corner-bracket pc-cb-br" />

        {children}
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="pc-terminal-keyboard-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f0ff', fontWeight: '700' }}>
          <Keyboard size={18} />
          <span>TERMINAL CONTROLS:</span>
        </div>

        <div className="pc-shortcut-group">
          <div className="pc-key-item">
            <span className="pc-key-badge">A</span>
            <span>Opt A</span>
          </div>
          <div className="pc-key-item">
            <span className="pc-key-badge">B</span>
            <span>Opt B</span>
          </div>
          <div className="pc-key-item">
            <span className="pc-key-badge">C</span>
            <span>Opt C</span>
          </div>
          <div className="pc-key-item">
            <span className="pc-key-badge">D</span>
            <span>Opt D</span>
          </div>
          <div className="pc-key-item" style={{ marginLeft: '10px' }}>
            <span className="pc-key-badge pc-key-badge-action">ENTER</span>
            <span className="pc-key-badge pc-key-badge-action">SPACE</span>
            <span style={{ color: '#00ffaa' }}>Lock-In Answer</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComputerScreenTerminal;
