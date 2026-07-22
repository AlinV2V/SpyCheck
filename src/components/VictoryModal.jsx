import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, AlertOctagon, RotateCcw, Home, Award, Eye, CheckCircle2, XCircle, HelpCircle, BarChart3 } from 'lucide-react';
import { playVictory, playDefeat, playClick } from '../services/audio';
import { RenderAvatar } from './Lobby';

export default function VictoryModal({ gameState, onRematch, onReturnToLobby }) {
  const { winner, spyIndex, players, currentRound } = gameState;
  const history = gameState?.roundHistory || [];
  const spyPlayer = players[spyIndex];
  const isAgentVictory = winner === 'agents';
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    if (isAgentVictory) {
      playVictory();

      if (confettiFiredRef.current) return;
      confettiFiredRef.current = true;

      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      function fire(particleRatio, opts) {
        try {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        } catch (e) {
        }
      }

      fire(0.25, { spread: 26, startVelocity: 55, colors: ['#3b82f6', '#3b82f6'] });
      fire(0.2, { spread: 60, colors: ['#ffffff', '#3b82f6'] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#f59e0b', '#3b82f6'] });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } else {
      playDefeat();
    }
  }, [isAgentVictory]);

  return (
    <div className="victory-modal-overlay animate-fade-in" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 7, 12, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '36px',
        borderRadius: '20px',
        background: 'rgba(10, 13, 20, 0.96)',
        border: isAgentVictory ? '2px solid #3b82f6' : '2px solid #ef4444',
        boxShadow: isAgentVictory ? '0 0 60px rgba(59, 130, 246, 0.35)' : '0 0 60px rgba(239, 68, 68, 0.35)',
        color: '#fff',
        textAlign: 'center'
      }}>

        {/* Victory / Defeat Header */}
        <div style={{ marginBottom: '24px' }}>
          {isAgentVictory ? (
            <div style={{ color: '#3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={72} className="animate-pulse" />
              <h1 className="glitch-text" style={{ fontFamily: 'Orbitron', fontSize: '2.6rem', margin: 0, letterSpacing: '2px', color: '#3b82f6' }}>
                INTRUDER NEUTRALIZED - AGENTS WIN
              </h1>
              <p style={{ fontFamily: 'Rajdhani', fontSize: '1.25rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                SECURITY CONSENSUS MATCHED! THE INTRUDER WAS UNMASKED & CONTAINED.
              </p>
            </div>
          ) : (
            <div style={{ color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <AlertOctagon size={72} className="animate-pulse" />
              <h1 className="glitch-text" style={{ fontFamily: 'Orbitron', fontSize: '2.5rem', margin: 0, letterSpacing: '2px', color: '#ef4444' }}>
                SECURITY BREACH - INTRUDER SURVIVED & ESCAPED
              </h1>
              <p style={{ fontFamily: 'Rajdhani', fontSize: '1.25rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                THE INTRUDER EVADED DETECTION AND BLENDED IN ACROSS ALL ROUNDS!
              </p>
            </div>
          )}
        </div>

        {/* Classified Intruder Identity Card */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '14px',
          padding: '22px',
          margin: '24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <RenderAvatar avatar={spyPlayer?.avatar} size={64} borderColor={spyPlayer?.color || '#ef4444'} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontFamily: 'Orbitron', letterSpacing: '1.5px', marginBottom: '4px' }}>
              CLASSIFIED DOSSIER REVEAL:
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: spyPlayer?.color || '#ef4444', fontFamily: 'Orbitron' }}>
              {spyPlayer?.name}
            </div>
            <div style={{ fontSize: '1rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <Award size={16} /> TRUE ROLE: COVERT INTRUDER (SPY)
            </div>
          </div>
        </div>

        {/* Round Summary Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          margin: '24px 0'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'Orbitron' }}>ROUNDS PLAYED</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#3b82f6', fontFamily: 'Orbitron' }}>{currentRound} / 3</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'Orbitron' }}>TOTAL OPERATORS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#3b82f6', fontFamily: 'Orbitron' }}>{players.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'Orbitron' }}>FINAL OUTCOME</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: isAgentVictory ? '#3b82f6' : '#ef4444', fontFamily: 'Orbitron' }}>
              {isAgentVictory ? 'NEUTRALIZED' : 'ESCAPED'}
            </div>
          </div>
        </div>

        {/* Answers & Telemetry Breakdown */}
        {history.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '28px' }}>
            <h4 style={{ fontFamily: 'Orbitron', color: '#3b82f6', fontSize: '1.05rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} /> MISSION TELEMETRY & ANSWERS BREAKDOWN
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((rh, idx) => {
                const questionText = rh.question?.text || rh.question?.question || 'Unknown Question';
                const spyAnswerIndex = rh.answers?.[spyIndex];
                const spyChoice = (spyAnswerIndex !== undefined && rh.question?.options?.[spyAnswerIndex])
                  ? rh.question.options[spyAnswerIndex]
                  : 'Unknown';
                const eliminatedIndex = rh.accusedIndex;
                const isSpyCaught = rh.isSpyCaught;

                return (
                  <div key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '16px',
                    borderRadius: '10px',
                    borderLeft: isSpyCaught ? '4px solid #3b82f6' : '4px solid #ef4444',
                    fontSize: '0.95rem'
                  }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '6px' }}>
                      Round {rh.roundNumber}: "{questionText}"
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                      <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', borderRadius: '6px' }}>
                        Spy ({spyPlayer?.name}) Chose: <strong style={{ color: '#f59e0b' }}>{spyChoice}</strong>
                      </div>
                      <div style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59,130,246,0.3)', padding: '4px 10px', borderRadius: '6px' }}>
                        Accused Operator: <strong style={{ color: eliminatedIndex >= 0 ? (players[eliminatedIndex]?.color || '#fff') : '#fff' }}>{eliminatedIndex >= 0 ? players[eliminatedIndex]?.name : 'None'}</strong>
                      </div>
                      <div style={{ background: isSpyCaught ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '6px', color: isSpyCaught ? '#3b82f6' : '#ef4444' }}>
                        Status: {isSpyCaught ? 'Intruder Caught' : 'Innocent Eliminated'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
          <button
            onClick={() => { playClick(); onRematch(); }}
            className="cyber-button"
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
              color: '#000',
              fontFamily: 'Orbitron',
              fontWeight: 900,
              fontSize: '1.1rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={20} /> START REMATCH
          </button>

          <button
            onClick={() => { playClick(); onReturnToLobby(); }}
            className="cyber-button variant-outline"
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Home size={20} /> RETURN TO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
}
