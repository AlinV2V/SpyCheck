import React, { useState } from 'react';
import { Shield, AlertTriangle, Crosshair, Target, Lock, Eye, Zap, Radio } from 'lucide-react';
import { playClick, playLaserLock, playVoteCast, playRevealSting, playAlertSiren } from '../services/audio';
import { calculateBotVote } from '../services/botAI';
import { RenderAvatar } from './Lobby';

export default function VotingPhase({ gameState, onCastVote, onProceedToResolution }) {
  const { players, spyIndex, currentRound, mode } = gameState;

  // In Pass & Play, we cycle through human players for secret voting. In solo_ai, player 0 votes, bots auto-vote.
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [isVoterReady, setIsVoterReady] = useState(mode === 'solo_ai'); // True by default for solo AI mode
  const [accumulatedVotes, setAccumulatedVotes] = useState({}); // voterIndex -> accusedIndex
  const [selectedSuspect, setSelectedSuspect] = useState(null);

  // Reveal Sequence States
  const [votingState, setVotingState] = useState('voting'); // 'voting' | 'revealing' | 'complete'
  const [talliedVotes, setTalliedVotes] = useState({}); // targetIndex -> count during reveal
  const [accusedIndex, setAccusedIndex] = useState(null);
  const [isSpyCaught, setIsSpyCaught] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);

  const currentVoter = players[currentVoterIndex];

  // Laser target selection handler
  const handleSelectSuspect = (playerIndex) => {
    if (votingState !== 'voting') return;
    // Cannot vote for oneself
    if (playerIndex === currentVoterIndex) return;

    setSelectedSuspect(playerIndex);
    playLaserLock();
  };

  // Lock in secret vote for current voter
  const handleConfirmVote = () => {
    if (selectedSuspect === null || votingState !== 'voting') return;
    playVoteCast();

    const newVotes = { ...accumulatedVotes, [currentVoterIndex]: selectedSuspect };
    setAccumulatedVotes(newVotes);

    if (onCastVote) {
      onCastVote({ voterIndex: currentVoterIndex, accusedIndex: selectedSuspect });
    }

    // Check if more human voters need to vote in Pass & Play mode
    if (mode === 'pass_play' && currentVoterIndex < players.length - 1) {
      setSelectedSuspect(null);
      setIsVoterReady(false);
      setCurrentVoterIndex(prev => prev + 1);
    } else {
      // All human votes gathered! Process bots if solo_ai mode
      finalizeAllVotes(newVotes);
    }
  };

  // Finalize all votes and start the dramatic reveal sequence
  const finalizeAllVotes = (humanVotes) => {
    const finalVotes = { ...humanVotes };

    // Fill bot votes if solo_ai mode
    if (mode === 'solo_ai') {
      players.slice(1).forEach((botPlayer, idx) => {
        const botIndex = idx + 1;
        const botVote = calculateBotVote({
          bot: botPlayer.botPersona,
          botIndex,
          allAnswers: gameState.playerAnswers,
          isSpy: botIndex === spyIndex,
          playerCount: players.length
        });
        finalVotes[botIndex] = botVote;
      });
    }

    // Determine final accused player
    const counts = {};
    Object.values(finalVotes).forEach(target => {
      counts[target] = (counts[target] || 0) + 1;
    });

    let maxVotes = -1;
    let mostVoted = 0;
    Object.entries(counts).forEach(([target, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVoted = Number(target);
      }
    });

    setAccusedIndex(mostVoted);
    const caught = mostVoted === spyIndex;
    setIsSpyCaught(caught);

    // Transition to dramatic laser reveal
    setVotingState('revealing');

    // Reveal votes one by one with incoming laser target sound FX
    const voteEntries = Object.entries(finalVotes);
    voteEntries.forEach(([_voterIdx, targetIdx], stepIdx) => {
      setTimeout(() => {
        setTalliedVotes(prev => ({
          ...prev,
          [targetIdx]: (prev[targetIdx] || 0) + 1
        }));
        playLaserLock();
      }, (stepIdx + 1) * 800);
    });

    // Final reveal sting and siren alarm
    const totalDuration = (voteEntries.length + 1) * 800;
    setTimeout(() => {
      setVotingState('complete');
      playRevealSting(caught);

      if (caught) {
        setSirenActive(true);
        playAlertSiren();
      }
    }, totalDuration);
  };

  return (
    <div className="hud-container animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Background Siren Alert Overlay */}
      {sirenActive && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 90,
          animation: 'alert-flash 1s infinite ease-in-out',
          boxShadow: 'inset 0 0 100px rgba(255, 0, 85, 0.5)'
        }} />
      )}

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: '16px',
        background: 'rgba(10, 13, 20, 0.92)',
        border: sirenActive ? '2px solid #ff0055' : '1px solid rgba(0, 240, 255, 0.3)',
        boxShadow: sirenActive ? '0 0 60px rgba(255, 0, 85, 0.4)' : '0 0 40px rgba(0, 240, 255, 0.15)'
      }}>

        {/* Phase Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 16px',
            background: 'rgba(255, 0, 85, 0.15)',
            border: '1px solid rgba(255, 0, 85, 0.4)',
            borderRadius: '20px',
            color: '#ff0055',
            fontSize: '0.85rem',
            fontFamily: 'Orbitron',
            marginBottom: '10px'
          }}>
            <Radio size={14} className="animate-pulse" /> SECURITY CHECKSUM // ROUND {currentRound}
          </div>
          <h2 className="glitch-text" style={{ fontSize: '2.2rem', margin: 0, color: '#fff' }}>
            INTRUDER TARGETING MATRIX
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '6px', fontFamily: 'Rajdhani' }}>
            {votingState === 'voting' && !isVoterReady && `PASS DEVICE TO ${currentVoter?.name.toUpperCase()}`}
            {votingState === 'voting' && isVoterReady && `SECRET VOTE: Select the suspected Intruder console to lock laser target.`}
            {votingState === 'revealing' && `COMPUTING TARGET LOCKS... INCOMING LASER CONVERGENCE`}
            {votingState === 'complete' && (isSpyCaught ? `INTRUDER IDENTIFIED AND TARGETED!` : `SECURITY BREACH! INNOCENT ELIMINATED!`)}
          </p>
        </div>

        {/* Secret Pass & Play Intermediary Screen */}
        {votingState === 'voting' && !isVoterReady && mode === 'pass_play' && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            border: '1px dashed rgba(0, 240, 255, 0.3)',
            margin: '20px 0'
          }}>
            <Lock size={48} color="#00f0ff" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.6rem', color: currentVoter?.color || '#00f0ff' }}>
              {currentVoter?.name}'S TURN TO VOTE
            </h3>
            <p style={{ color: 'var(--color-text-muted)', margin: '12px 0 24px 0' }}>
              Ensure other operators are not looking at the display.
            </p>
            <button
              onClick={() => { playClick(); setIsVoterReady(true); }}
              className="cyber-button"
              style={{ padding: '14px 32px', fontSize: '1.1rem' }}
            >
              <Eye size={18} /> I AM {currentVoter?.name.toUpperCase()} - CONFIRM IDENTITY
            </button>
          </div>
        )}

        {/* Laser Targeting Grid */}
        {((votingState === 'voting' && isVoterReady) || votingState !== 'voting') && (
          <div style={{ marginBottom: '28px' }}>
            <div className={`player-stations-grid stations-${players.length}`}>
              {players.map((player, idx) => {
                const isSelf = idx === currentVoterIndex && votingState === 'voting';
                const isSelected = selectedSuspect === idx;
                const isTargetAccused = accusedIndex === idx && (votingState === 'revealing' || votingState === 'complete');
                const incomingVotes = talliedVotes[idx] || 0;

                return (
                  <div
                    key={player.id}
                    onClick={() => !isSelf && votingState === 'voting' && handleSelectSuspect(idx)}
                    className={`cyber-card ${isSelected ? 'alert-mode' : ''}`}
                    style={{
                      cursor: isSelf || votingState !== 'voting' ? 'default' : 'pointer',
                      opacity: isSelf && votingState === 'voting' ? 0.45 : 1,
                      border: isTargetAccused
                        ? (isSpyCaught ? '2px solid #ff0055' : '2px solid #ffaa00')
                        : isSelected
                        ? '2px solid #ff0055'
                        : '1px solid rgba(0, 240, 255, 0.2)',
                      background: isTargetAccused
                        ? (isSpyCaught ? 'rgba(255, 0, 85, 0.25)' : 'rgba(255, 170, 0, 0.2)')
                        : isSelected
                        ? 'rgba(255, 0, 85, 0.15)'
                        : 'rgba(18, 24, 36, 0.65)',
                      transform: isTargetAccused ? 'scale(1.04)' : isSelected ? 'scale(1.02)' : 'none',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Corner Laser Reticle Indicators */}
                    <div style={{ position: 'absolute', top: '6px', left: '6px', borderTop: '2px solid #00f0ff', borderLeft: '2px solid #00f0ff', width: '10px', height: '10px' }} />
                    <div style={{ position: 'absolute', top: '6px', right: '6px', borderTop: '2px solid #00f0ff', borderRight: '2px solid #00f0ff', width: '10px', height: '10px' }} />
                    <div style={{ position: 'absolute', bottom: '6px', left: '6px', borderBottom: '2px solid #00f0ff', borderLeft: '2px solid #00f0ff', width: '10px', height: '10px' }} />
                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', borderBottom: '2px solid #00f0ff', borderRight: '2px solid #00f0ff', width: '10px', height: '10px' }} />

                    {/* Scanning Laser Beam Line animation on hover/target */}
                    {(isSelected || isTargetAccused) && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        height: '3px',
                        background: isTargetAccused ? '#ff0055' : '#00f0ff',
                        boxShadow: isTargetAccused ? '0 0 12px #ff0055' : '0 0 12px #00f0ff',
                        animation: 'scanner-beam 1.5s infinite linear'
                      }} />
                    )}

                    {/* Laser Target Reticle Overlay */}
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#ff0055' }}>
                        <div className="laser-pointer" />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.4))' }}>
                        <RenderAvatar avatar={player.avatar} size={54} />
                      </div>

                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{
                          fontFamily: 'Orbitron',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: player.color || '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {player.name}
                          {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>(YOU)</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'Rajdhani', marginTop: '2px' }}>
                          ROLE: {votingState === 'complete' && idx === spyIndex ? 'INTRUDER' : 'OPERATOR'}
                        </div>
                      </div>
                    </div>

                    {/* Incoming Laser Target Counter */}
                    {(votingState === 'revealing' || votingState === 'complete') && incomingVotes > 0 && (
                      <div style={{
                        marginTop: '12px',
                        padding: '6px 12px',
                        background: 'rgba(255, 0, 85, 0.2)',
                        border: '1px solid rgba(255, 0, 85, 0.5)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'Orbitron',
                        fontSize: '0.85rem',
                        color: '#ff0055',
                        animation: 'slide-up 0.3s ease-out'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Crosshair size={14} className="animate-spin" /> TARGET LOCKS
                        </span>
                        <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                          {incomingVotes} {incomingVotes === 1 ? 'VOTE' : 'VOTES'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Voting Action Controls */}
        {votingState === 'voting' && isVoterReady && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              disabled={selectedSuspect === null}
              onClick={handleConfirmVote}
              className="cyber-button variant-crimson"
              style={{
                padding: '16px 44px',
                fontSize: '1.2rem',
                opacity: selectedSuspect === null ? 0.4 : 1,
                cursor: selectedSuspect === null ? 'not-allowed' : 'pointer'
              }}
            >
              <Target size={22} /> LOCK LASER TARGET & TRANSMIT
            </button>
          </div>
        )}

        {/* Intruder Reveal Screen & Resolution Trigger */}
        {votingState === 'complete' && (
          <div className="slide-up-anim" style={{
            marginTop: '28px',
            padding: '24px',
            borderRadius: '12px',
            background: isSpyCaught ? 'rgba(0, 255, 170, 0.1)' : 'rgba(255, 0, 85, 0.12)',
            border: isSpyCaught ? '1px solid rgba(0, 255, 170, 0.4)' : '1px solid rgba(255, 0, 85, 0.4)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.6rem',
              fontFamily: 'Orbitron',
              fontWeight: 900,
              color: isSpyCaught ? '#00ffaa' : '#ff0055',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              {isSpyCaught ? (
                <>
                  <Shield size={32} /> INTRUDER NEUTRALIZED! SECURITY BREACH PREVENTED!
                </>
              ) : (
                <>
                  <AlertTriangle size={32} /> INNOCENT OPERATOR VOTED OUT! THE INTRUDER SURVIVES!
                </>
              )}
            </div>

            <p style={{ color: 'var(--color-text-main)', fontSize: '1.1rem', fontFamily: 'Rajdhani', marginBottom: '20px' }}>
              The Security System recorded candidate <strong>{players[accusedIndex]?.name}</strong> with the highest target consensus.
              {isSpyCaught ? ' The Intruder was caught!' : ' The true Intruder is still hiding!'}
            </p>

            <button
              onClick={() => {
                playClick();
                onProceedToResolution({ accusedIndex, isSpyCaught });
              }}
              className="cyber-button"
              style={{
                padding: '16px 38px',
                fontSize: '1.15rem',
                background: isSpyCaught ? 'linear-gradient(90deg, #00ffaa 0%, #00f0ff 100%)' : 'linear-gradient(90deg, #ff0055 0%, #ffaa00 100%)'
              }}
            >
              <Zap size={20} /> PROCEED TO MISSION DEBRIEF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
