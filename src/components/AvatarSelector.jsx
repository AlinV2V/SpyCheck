import React, { useState, useEffect } from 'react';
import { 
  Terminal, Eye, Ghost, Cpu, Zap, Crosshair, 
  Shield, Skull, Flame, Radio, Sparkles, Check, X, RefreshCw, User
} from 'lucide-react';

export const AVATAR_OPTIONS = [
  { id: 'hacker', label: 'Cyber Hacker', icon: Terminal },
  { id: 'phantom', label: 'Phantom Agent', icon: Eye },
  { id: 'ghost', label: 'Neural Ghost', icon: Ghost },
  { id: 'cyborg', label: 'Synth Cyborg', icon: Cpu },
  { id: 'viper', label: 'Viper Strike', icon: Zap },
  { id: 'spectre', label: 'Spectre Operative', icon: Crosshair },
  { id: 'sentinel', label: 'Sentinel Guard', icon: Shield },
  { id: 'cipher', label: 'Matrix Cipher', icon: Skull },
  { id: 'runner', label: 'Apex Runner', icon: Flame },
  { id: 'beacon', label: 'Quantum Beacon', icon: Radio },
];

export const FRAME_COLORS = [
  { id: 'cyan', name: 'Neon Cyan', hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
  { id: 'crimson', name: 'Crimson Red', hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
  { id: 'amber', name: 'Amber Gold', hex: '#ffaa00', glow: 'rgba(255, 170, 0, 0.5)' },
  { id: 'matrix', name: 'Matrix Green', hex: '#3b82f6', glow: 'rgba(0, 255, 170, 0.5)' },
  { id: 'purple', name: 'Electric Purple', hex: '#b026ff', glow: 'rgba(176, 38, 255, 0.5)' },
  { id: 'pink', name: 'Plasma Pink', hex: '#ff00aa', glow: 'rgba(255, 0, 170, 0.5)' },
];

const RANDOM_CALLSIGNS = [
  "Agent K-9", "Ghost_Zero", "CyberViper", "Spectre-7", "NeonPulse", 
  "ShadowByte", "NullPointer", "MatrixEcho", "QuantumFox", "CodeRed",
  "CircuitBreaker", "VoidWalker", "Synapse-9", "TitanGrid", "DataPhantom"
];

export default function AvatarSelector({
  isOpen = true,
  initialData = {},
  onSave,
  onClose,
  title = "SECURITY CLEARANCE & AVATAR CONFIG"
}) {
  const [name, setName] = useState(initialData.name || 'Operative-1');
  const [avatarId, setAvatarId] = useState(initialData.avatarId || 'hacker');
  const [frameColor, setFrameColor] = useState(initialData.frameColor || '#3b82f6');

  useEffect(() => {
    if (initialData.name) setName(initialData.name);
    if (initialData.avatarId) setAvatarId(initialData.avatarId);
    if (initialData.frameColor) setFrameColor(initialData.frameColor);
  }, [initialData]);

  if (!isOpen) return null;

  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];
  const IconComponent = currentAvatar.icon;

  const handleRandomize = () => {
    const randomCallsign = RANDOM_CALLSIGNS[Math.floor(Math.random() * RANDOM_CALLSIGNS.length)];
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)].id;
    const randomColor = FRAME_COLORS[Math.floor(Math.random() * FRAME_COLORS.length)].hex;

    setName(randomCallsign);
    setAvatarId(randomAvatar);
    setFrameColor(randomColor);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        name: name.trim() || 'Operative',
        avatarId,
        frameColor
      });
    }
    if (onClose) onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(6, 8, 13, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div 
        className="glass-panel slide-up-anim"
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'rgba(10, 13, 20, 0.95)',
          border: `1px solid ${frameColor}`,
          boxShadow: `0 0 30px ${frameColor}40, 0 15px 40px rgba(0,0,0,0.8)`,
          padding: '2rem',
          position: 'relative'
        }}
      >
        {/* Top Cyber Accent Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${frameColor}, transparent)`
        }} />

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
          paddingBottom: '1rem'
        }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              color: frameColor,
              letterSpacing: '0.15em',
              fontWeight: 700,
              display: 'block'
            }}>
              // PERSONA IDENTIFICATION
            </span>
            <h2 style={{
              fontSize: '1.25rem',
              fontFamily: 'var(--font-title)',
              color: '#ffffff',
              margin: 0
            }}>
              {title}
            </h2>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Live Preview Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(18, 24, 36, 0.7)',
            border: `1px solid ${frameColor}`,
            boxShadow: `0 0 20px ${frameColor}30`,
            borderRadius: '8px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(6, 8, 13, 0.9)',
              border: `2px solid ${frameColor}`,
              boxShadow: `0 0 15px ${frameColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: frameColor
            }}>
              <IconComponent size={42} />
            </div>

            <span style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              wordBreak: 'break-word',
              maxWidth: '100%'
            }}>
              {name || 'UNKNOWN'}
            </span>

            <span style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-ui)',
              color: frameColor,
              marginTop: '0.25rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              {currentAvatar.label}
            </span>

            <div style={{
              marginTop: '0.75rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: `${frameColor}15`,
              border: `1px solid ${frameColor}50`,
              borderRadius: '3px',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: frameColor,
              textTransform: 'uppercase'
            }}>
              STATUS: ACTIVE
            </div>
          </div>

          {/* Configuration Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Callsign Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>
                  CALLSIGN / AGENT NAME
                </label>
                <button
                  onClick={handleRandomize}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 600
                  }}
                >
                  <RefreshCw size={12} /> Randomize
                </button>
              </div>
              <input
                type="text"
                maxLength={18}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter callsign..."
                className="cyber-input"
                style={{
                  borderColor: frameColor,
                  boxShadow: `inset 0 0 8px ${frameColor}20`
                }}
              />
            </div>

            {/* Avatar Icon Selection */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                AVATAR EMBLEM
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem'
              }}>
                {AVATAR_OPTIONS.map((opt) => {
                  const IconComponentOpt = opt.icon;
                  const isSelected = opt.id === avatarId;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAvatarId(opt.id)}
                      title={opt.label}
                      style={{
                        height: '44px',
                        backgroundColor: isSelected ? `${frameColor}25` : 'rgba(18, 24, 36, 0.6)',
                        border: isSelected ? `2px solid ${frameColor}` : '1px solid rgba(59, 130, 246, 0.15)',
                        borderRadius: '6px',
                        color: isSelected ? frameColor : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 0 12px ${frameColor}50` : 'none'
                      }}
                    >
                      <IconComponentOpt size={20} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frame Color Selection */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                CYBER FRAME MATRIX COLOR
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '0.5rem'
              }}>
                {FRAME_COLORS.map((c) => {
                  const isSelected = c.hex.toLowerCase() === frameColor.toLowerCase();
                  return (
                    <button
                      key={c.id}
                      onClick={() => setFrameColor(c.hex)}
                      title={c.name}
                      style={{
                        height: '36px',
                        backgroundColor: c.hex,
                        border: isSelected ? '2px solid #ffffff' : '1px solid transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isSelected ? `0 0 16px ${c.hex}` : `0 0 6px ${c.hex}40`,
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isSelected && <Check size={16} color="#000000" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(59, 130, 246, 0.15)'
        }}>
          {onClose && (
            <button
              onClick={onClose}
              className="cyber-button variant-outline"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
            >
              CANCEL
            </button>
          )}

          <button
            onClick={handleSave}
            className="cyber-button"
            style={{
              backgroundColor: frameColor,
              color: '#06080d',
              boxShadow: `0 0 20px ${frameColor}80`,
              padding: '0.65rem 1.75rem',
              fontSize: '0.9rem'
            }}
          >
            CONFIRM IDENTITY <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
