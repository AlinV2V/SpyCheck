import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Crosshair, Target, Lock, Eye, Zap, Radio } from 'lucide-react';
import { playClick, playLaserLock, playVoteCast, playRevealSting, playAlertSiren } from '../services/audio';
import { calculateBotVote } from '../services/botAI';
import { RenderAvatar } from './Lobby';

export default function VotingPhase({ gameState, onCastVote, onProceedToResolution }) {
  const { players, spyIndex, currentRound, mode } = gameState;
  const questionObj = gameState?.currentQuestion || gameState?.question;
  const questionTitle = questionObj?.question || questionObj?.text || (typeof questionObj === 'string' ? questionObj : 'Secret Security Check Prompt');

  const gameId = `${currentRound}-${questionObj?.id || questionObj?.question || '0'}`;

  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [isVoterReady, setIsVoterReady] = useState(mode === 'solo_ai');
  const [accumulatedVotes, setAccumulatedVotes] = useState({});
  const [selectedSuspect, setSelectedSuspect] = useState(null);

  const [votingState, setVotingState] = useState('voting');
  const [talliedVotes, setTalliedVotes] = useState({});
  const [accusedIndex, setAccusedIndex] = useState(null);
  const [isSpyCaught, setIsSpyCaught] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);

  const timeoutRefs = useRef([]);

  useEffect(() => {
    setCurrentVoterIndex(0);
    setIsVoterReady(mode === 'solo_ai');
    setAccumulatedVotes({});
    setSelectedSuspect(null);
    setVotingState('voting');
    setTalliedVotes({});
    setAccusedIndex(null);
    setIsSpyCaught(false);
    setSirenActive(false);
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, [gameId]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, []);

  const currentVoter = players[currentVoterIndex];

  const handleSelectSuspect = (playerIndex) => {
    if (votingState !== 'voting') return;
    if (playerIndex === currentVoterIndex) return;

    setSelectedSuspect(playerIndex);
    playLaserLock();
  };

  const handleConfirmVote = () => {
    if (selectedSuspect === null || votingState !== 'voting') return;
    playVoteCast();

    const newVotes = { ...accumulatedVotes, [currentVoterIndex]: selectedSuspect };
    setAccumulatedVotes(newVotes);

    if (onCastVote) {
      onCastVote(selectedSuspect);
    }

    if (mode === 'pass_play' && currentVoterIndex < players.length - 1) {
      setSelectedSuspect(null);
      setIsVoterReady(false);
      setCurrentVoterIndex(prev => prev + 1);
    } else {
      finalizeAllVotes(newVotes);
    }
  };

  const finalizeAllVotes = (humanVotes) => {
    const finalVotes = { ...humanVotes };

    if (mode === 'solo_ai') {
      const allAnswers = players.map((p, idx) => ({
        playerId: p.id,
        playerName: p.name,
        answer: gameState.playerAnswers?.[idx],
        id: p.id,
        name: p.name
      }));

      players.slice(1).forEach((botPlayer, idx) => {
        const botIndex = idx + 1;
        const botVote = calculateBotVote({
          bot: botPlayer.botPersona,
          botIndex,
          allAnswers,
          isSpy: botIndex === spyIndex,
          playerCount: players.length
        });
        if (botVote !== null && botVote !== undefined) {
          const targetPlayerIndex = players.findIndex(p => p.id === botVote);
          if (targetPlayerIndex !== -1) {
            finalVotes[botIndex] = targetPlayerIndex;
          }
        }
      });
    }

    const counts = {};
    Object.values(finalVotes).forEach(target => {
      counts[target] = (counts[target] || 0) + 1;
    });

    let maxVotes = -1;
    let mostVoted = 0;
    let tiedPlayers = [];
    Object.entries(counts).forEach(([target, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVoted = Number(target);
        tiedPlayers = [Number(target)];
      } else if (count === maxVotes) {
        tiedPlayers.push(Number(target));
      }
    });

    if (tiedPlayers.length > 1) {
      mostVoted = tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
    }

    setAccusedIndex(mostVoted);
    const caught = mostVoted === spyIndex;
    setIsSpyCaught(caught);

    setVotingState('revealing');

    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    const voteEntries = Object.entries(finalVotes);
    voteEntries.forEach(([_voterIdx, targetIdx], stepIdx) => {
      const id = setTimeout(() => {
        setTalliedVotes(prev => ({
          ...prev,
          [targetIdx]: (prev[targetIdx] || 0) + 1
        }));
        playLaserLock();
      }, (stepIdx + 1) * 800);
      timeoutRefs.current.push(id);
    });

    const totalDuration = (voteEntries.length + 1) * 800;
    const finalId = setTimeout(() => {
      setVotingState('complete');
      playRevealSting(caught);
      if (caught) {
        setSirenActive(true);
        playAlertSiren();
      }
    }, totalDuration);
    timeoutRefs.current.push(finalId);
  };

  return (
    <div className="hud-container animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
          boxShadow: 'inset 0 0 100px rgba(239, 68, 68, 0.5)'
        }} />
      )}

      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: '16px',
        background: 'rgba(10, 13, 20, 0.92)',
        border: sirenActive ? '2px solid #ef4444' : '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: sirenActive ? '0 0 60px rgba(239, 68, 68, 0.4)' : '0 0 40px rgba(59, 130, 246, 0.15)'
      }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '20px',
            color: '#ef4444',
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

        {votingState === 'voting' && !isVoterReady && mode === 'pass_play' && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            border: '1px dashed rgba(59, 130, 246, 0.3)',
            margin: '20px 0'
          }}>
            <Lock size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.6rem', color: currentVoter?.color || '#3b82f6' }}>
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

        {((votingState === 'voting' && isVoterReady) || votingState !== 'voting') && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', color: '#3b82f6', letterSpacing: '1.5px', marginBottom: '4px' }}>
                {"\U0001F513"} REVEALED SECURITY CHECK PROMPT (SPY CAN SEE QUESTION NOW)
              </div>
              <h3 style={{ fontFamily: 'Rajdhani', fontSize: '1.35rem', color: '#ffffff', margin: '0 0 4px 0', fontWeight: 700 }}>
                "{questionTitle}"
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Rajdhani' }}>
                Cross-examine everyone's choices against the revealed prompt to vote out the Spy!
              </div>
            </div>

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
                        ? (isSpyCaught ? '2px solid #ef4444' : '2px solid #f59e0b')
                        : isSelected
                        ? '2px solid #ef4444'
                        : '1px solid rgba(59, 130, 246, 0.2)',
                      background: isTargetAccused
                        ? (isSpyCaught ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.2)')
                        : isSelected
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(18, 24, 36, 0.65)',
                      transform: isTargetAccused ? 'scale(1.04)' : isSelected ? 'scale(1.02)' : 'none',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '6px', left: '6px', borderTop: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6', width: '10px', height: '10px' }} />
                    <div style={{ position: 'absolute', top: '6px', right: '6px', borderTop: '2px solid #3b82f6', borderRight: '2px solid #3b82f6', width: '10px', height: '10px' }} />
                    <div style={{ position: 'absolute', bottom: '6px', left: '6px', borderBottom: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6', width: '10px', height: '10px' }} />
                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', borderBottom: '2px solid #3b82f6', borderRight: '2px solid #3b82f6', width: '10px', height: '10px' }} />

                    {(isSelected || isTargetAccused) && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        height: '3px',
                        background: isTargetAccused ? '#ef4444' : '#3b82f6',
                        boxShadow: isTargetAccused ? '0 0 12px #ef4444' : '0 0 12px #3b82f6',
                        animation: 'scanner-beam 1.5s infinite linear'
                      }} />
                    )}

                    {isSelected && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444' }}>
                        <div className="laser-pointer" />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.4))' }}>
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

                    {(votingState === 'revealing' || votingState === 'complete') && incomingVotes > 0 && (
                      <div style={{
                        marginTop: '12px',
                        padding: '6px 12px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'Orbitron',
                        fontSize: '0.85rem',
                        color: '#ef4444',
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

        {votingState === 'voting' && isVoterReady && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              disabled={selectedSuspect === null}
              onClick={handleConfirmVote}
              className="cyber-button variant-danger"
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

        {votingState === 'complete' && (
          <div className="slide-up-anim" style={{
            marginTop: '28px',
            padding: '24px',
            borderRadius: '12px',
            background: isSpyCaught ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.12)',
            border: isSpyCaught ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.6rem',
              fontFamily: 'Orbitron',
              fontWeight: 900,
              color: isSpyCaught ? '#3b82f6' : '#ef4444',
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
                background: isSpyCaught ? 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)' : 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)'
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
