import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, AlertOctagon, RotateCcw, Home, Award, Eye, CheckCircle2, XCircle, HelpCircle, BarChart3 } from 'lucide-react';
import { playVictory, playDefeat, playClick } from '../services/audio';

export default function VictoryModal({ gameState, onRematch, onReturnToLobby }) {
  const { winner, spyIndex, players, roundHistory, currentRound, playerAnswers } = gameState;
  const spyPlayer = players[spyIndex];
  const isAgentVictory = winner === 'agents';

  useEffect(() => {
    if (isAgentVictory) {
      playVictory();

      // Launch multi-stage canvas-confetti bursts for spectacular agent win
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
          // Fallback if canvas context issue
        }
      }

      fire(0.25, { spread: 26, startVelocity: 55, colors: ['#00f0ff', '#00ffaa'] });
      fire(0.2, { spread: 60, colors: ['#ffffff', '#00f0ff'] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#ffaa00', '#00ffaa'] });
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
        border: isAgentVictory ? '2px solid #00ffaa' : '2px solid #ff0055',
        boxShadow: isAgentVictory ? '0 0 60px rgba(0, 255, 170, 0.35)' : '0 0 60px rgba(255, 0, 85, 0.35)',
        color: '#fff',
        textAlign: 'center'
      }}>

        {/* Victory / Defeat Header */}
        <div style={{ marginBottom: '24px' }}>
          {isAgentVictory ? (
            <div style={{ color: '#00ffaa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={72} className="animate-pulse" />
              <h1 className="glitch-text" style={{ fontFamily: 'Orbitron', fontSize: '2.6rem', margin: 0, letterSpacing: '2px', color: '#00ffaa' }}>
                INTRUDER NEUTRALIZED - AGENTS WIN
              </h1>
              <p style={{ fontFamily: 'Rajdhani', fontSize: '1.25rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                SECURITY CONSENSUS MATCHED! THE INTRUDER WAS UNMASKED & CONTAINED.
              </p>
            </div>
          ) : (
            <div style={{ color: '#ff0055', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <AlertOctagon size={72} className="animate-pulse" />
              <h1 className="glitch-text" style={{ fontFamily: 'Orbitron', fontSize: '2.5rem', margin: 0, letterSpacing: '2px', color: '#ff0055' }}>
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
          border: '1px solid rgba(255, 0, 85, 0.4)',
          borderRadius: '14px',
          padding: '22px',
          margin: '24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          boxShadow: '0 0 30px rgba(255, 0, 85, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 12px rgba(255,0,85,0.5))' }}>
            {spyPlayer?.avatar}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', color: '#ffaa00', fontFamily: 'Orbitron', letterSpacing: '1.5px', marginBottom: '4px' }}>
              CLASSIFIED DOSSIER REVEAL:
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: spyPlayer?.color || '#ff0055', fontFamily: 'Orbitron' }}>
              {spyPlayer?.name}
            </div>
            <div style={{ fontSize: '1rem', color: '#ff0055', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
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
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00f0ff', fontFamily: 'Orbitron' }}>{currentRound} / 3</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'Orbitron' }}>TOTAL OPERATORS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00ffaa', fontFamily: 'Orbitron' }}>{players.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'Orbitron' }}>FINAL OUTCOME</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: isAgentVictory ? '#00ffaa' : '#ff0055', fontFamily: 'Orbitron' }}>
              {isAgentVictory ? 'NEUTRALIZED' : 'ESCAPED'}
            </div>
          </div>
        </div>

        {/* Answers & Telemetry Breakdown */}
        {roundHistory && roundHistory.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '28px' }}>
            <h4 style={{ fontFamily: 'Orbitron', color: '#00f0ff', fontSize: '1.05rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} /> MISSION TELEMETRY & ANSWERS BREAKDOWN
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roundHistory.map((rh, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px',
                  borderRadius: '10px',
                  borderLeft: rh.isSpyCaught ? '4px solid #00ffaa' : '4px solid #ff0055',
                  fontSize: '0.95rem'
                }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '6px' }}>
                    Round {rh.round}: "{rh.question?.question}"
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                    <div style={{ background: 'rgba(255, 170, 0, 0.15)', border: '1px solid rgba(255,170,0,0.3)', padding: '4px 10px', borderRadius: '6px' }}>
                      Spy ({spyPlayer?.name}) Chose: <strong style={{ color: '#ffaa00' }}>{rh.spyChoice || 'N/A'}</strong>
                    </div>
                    <div style={{ background: 'rgba(0, 240, 255, 0.12)', border: '1px solid rgba(0,240,255,0.3)', padding: '4px 10px', borderRadius: '6px' }}>
                      Accused Operator: <strong style={{ color: players[rh.accusedIndex]?.color || '#fff' }}>{players[rh.accusedIndex]?.name || 'None'}</strong>
                    </div>
                    <div style={{ background: rh.isSpyCaught ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 0, 85, 0.15)', padding: '4px 10px', borderRadius: '6px', color: rh.isSpyCaught ? '#00ffaa' : '#ff0055' }}>
                      Status: {rh.isSpyCaught ? 'Intruder Caught' : 'Innocent Eliminated'}
                    </div>
                  </div>
                </div>
              ))}
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
              background: 'linear-gradient(90deg, #00f0ff 0%, #00ffaa 100%)',
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
