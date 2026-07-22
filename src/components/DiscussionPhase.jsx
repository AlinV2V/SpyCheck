import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RenderAvatar } from './Lobby';

/**
 * DiscussionPhase Component
 * 
 * Central Command Screen for SpyCheck showing player choices, anomaly/discrepancy detection,
 * live AI bot banter chat log, Web Speech API text-to-speech integration, suspect tagging,
 * and countdown timer to proceed to voting.
 */
export function DiscussionPhase({ gameState, onProceedToVote }) {
  // ---------------------------------------------------------------------------
  // 1. Normalize Game State & Fallbacks
  // ---------------------------------------------------------------------------
  const rawPlayers = gameState?.players;
  const playersList = useMemo(() => {
    if (!rawPlayers) {
      return [
        { id: 'p1', name: 'Agent Alex (You)', avatar: '🕵️‍♂️', isBot: false, choice: 'Option B: Sector 7' },
        { id: 'p2', name: 'Cipher-9 AI', avatar: '🤖', isBot: true, choice: 'Option B: Sector 7' },
        { id: 'p3', name: 'Vortex-X AI', avatar: '👾', isBot: true, choice: 'Option D: Warehouse 12' },
        { id: 'p4', name: 'Shadow-7 AI', avatar: '👤', isBot: true, choice: 'Option B: Sector 7' },
      ];
    }
    if (Array.isArray(rawPlayers)) return rawPlayers;
    return Object.values(rawPlayers);
  }, [rawPlayers]);

  const questionObj = gameState?.currentQuestion || gameState?.question;
  const questionTitle = questionObj?.question || questionObj?.text || (typeof questionObj === 'string' ? questionObj : 'Secret Security Check Prompt');
  const initialDuration = gameState?.discussionDuration || gameState?.timer || 45;

  // Extract answer for each player
  const getPlayerChoice = useCallback((player, idx) => {
    if (!player) return 'No Choice';
    if (player.choice !== undefined && player.choice !== null) return String(player.choice);
    if (player.answer !== undefined && player.answer !== null) return String(player.answer);
    if (player.selectedOption !== undefined && player.selectedOption !== null) return String(player.selectedOption);

    const answers = gameState?.playerAnswers || gameState?.answers;
    if (answers) {
      if (answers[player.id] !== undefined && answers[player.id] !== null) return String(answers[player.id]);
      if (answers[player.name] !== undefined && answers[player.name] !== null) return String(answers[player.name]);
      if (idx !== undefined && answers[idx] !== undefined && answers[idx] !== null) return String(answers[idx]);
    }

    return 'No Choice';
  }, [gameState]);

  // ---------------------------------------------------------------------------
  // 2. Discrepancy & Anomaly Detection Logic
  // ---------------------------------------------------------------------------
  const { choiceCounts, totalAnswered, majorityChoice, discrepancies } = useMemo(() => {
    const counts = {};
    let total = 0;

    playersList.forEach((p, idx) => {
      const choice = getPlayerChoice(p, idx);
      if (choice && choice !== 'No Choice') {
        counts[choice] = (counts[choice] || 0) + 1;
        total++;
      }
    });

    let maxCount = 0;
    let majority = null;
    Object.entries(counts).forEach(([choice, count]) => {
      if (count > maxCount) {
        maxCount = count;
        majority = choice;
      }
    });

    // Discrepancy = any choice that differs from the majority when a clear majority exists (>1 player)
    const discrepancySet = new Set();
    if (total >= 3 && maxCount >= 2) {
      playersList.forEach((p, idx) => {
        const choice = getPlayerChoice(p, idx);
        if (choice !== majority && choice !== 'No Choice') {
          discrepancySet.add(p.id);
        }
      });
    }

    return {
      choiceCounts: counts,
      totalAnswered: total,
      majorityChoice: majority,
      discrepancies: discrepancySet,
    };
  }, [playersList, getPlayerChoice]);

  // ---------------------------------------------------------------------------
  // 3. Component Local State
  // ---------------------------------------------------------------------------
  const [taggedSuspects, setTaggedSuspects] = useState(() => new Set());
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [userChatInput, setUserChatInput] = useState('');

  const chatContainerRef = useRef(null);
  const speakTextRef = useRef(speakText);
  speakTextRef.current = speakText;

  // ---------------------------------------------------------------------------
  // 4. Web Speech API Initialization
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const availVoices = window.speechSynthesis.getVoices();
        setVoices(availVoices);
        // Default to first English voice if available
        const engIndex = availVoices.findIndex((v) => v.lang.startsWith('en'));
        if (engIndex !== -1) setSelectedVoiceIndex(engIndex);
      };

      updateVoices();
      window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    }
  }, []);

  const speakText = useCallback((text) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    // Stop ongoing speech
    window.speechSynthesis.cancel();

    // Clean emojis & formatting for cleaner speech output
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }, [speechEnabled, voices, selectedVoiceIndex, speechRate]);

  // ---------------------------------------------------------------------------
  // 5. Initial Chat Log & AI Bot Banter Generator
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Generate initial contextual discussion lines
    const initialMsgs = [];
    const outlierPlayers = playersList.filter((p) => discrepancies.has(p.id));
    const majorityPlayers = playersList.filter((p) => getPlayerChoice(p) === majorityChoice);

    // Initial announcement
    initialMsgs.push({
      id: 'sys-1',
      senderName: 'SYSTEM MONITOR',
      senderAvatar: '🛡️',
      isSystem: true,
      text: discrepancies.size > 0
        ? `⚠️ ALERT: Answer discrepancy detected! ${discrepancies.size} player(s) selected a conflicting option.`
        : `✅ ALL CLEAR: High consensus among players for ${majorityChoice || 'choices'}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // AI Bot comments
    const botPlayers = playersList.filter((p) => p.isBot);

    if (botPlayers.length > 0) {
      botPlayers.forEach((bot, index) => {
        const botChoice = getPlayerChoice(bot);
        const isOutlier = discrepancies.has(bot.id);
        let quote = '';

        if (isOutlier) {
          quote = `Wait! I know my choice (${botChoice}) looks different, but hear me out—the intel clue clearly hinted at this! Don't tag me!`;
        } else if (outlierPlayers.length > 0) {
          const target = outlierPlayers[index % outlierPlayers.length];
          quote = `Why did ${target.name} pick ${getPlayerChoice(target)} while the rest of us chose ${majorityChoice}? That is EXTREMELY suspicious!`;
        } else {
          quote = `Solid alignment on ${majorityChoice}. Either we all have the true location or the Spy is blending in carefully.`;
        }

        initialMsgs.push({
          id: `bot-init-${bot.id}`,
          senderId: bot.id,
          senderName: bot.name,
          senderAvatar: bot.avatar || '🤖',
          isBot: true,
          text: quote,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDiscrepancyMention: isOutlier || outlierPlayers.length > 0,
        });
      });
    }

    setChatMessages(initialMsgs);

    // Speak initial bot message if speech is on
    const firstBotMsg = initialMsgs.find((m) => m.isBot);
    if (firstBotMsg) {
      speakText(`${firstBotMsg.senderName} says: ${firstBotMsg.text}`);
    }
  }, [playersList, discrepancies, majorityChoice, getPlayerChoice, speakText]);

  // Dynamic ongoing bot banter during discussion
  useEffect(() => {
    if (timeLeft <= 0 || isTimerPaused) return;

    // Trigger banter every 12 seconds
    const interval = setInterval(() => {
      const botPlayers = playersList.filter((p) => p.isBot);
      if (botPlayers.length === 0) return;

      const speaker = botPlayers[Math.floor(Math.random() * botPlayers.length)];
      const speakerChoice = getPlayerChoice(speaker);
      const speakerIsOutlier = discrepancies.has(speaker.id);
      const outlierPlayers = playersList.filter((p) => discrepancies.has(p.id));

      const banters = [
        `Clock is ticking down! Look at the command screen, who made the outlier choice?`,
        `I am 100% confident in ${speakerChoice}. If anyone changed their answer, flag them immediately!`,
        speakerIsOutlier 
          ? `I swear I am innocent! Check my past voting record!` 
          : `Notice how quiet the Spy is being right now? Let's check the suspect tags.`,
        outlierPlayers.length > 0
          ? `I'm placing my suspect marker on ${outlierPlayers[0].name}. The answer mismatch speaks for itself!`
          : `Everyone agreeing so easily makes me even more nervous...`,
      ];

      const chosenBanter = banters[Math.floor(Math.random() * banters.length)];
      const newMsg = {
        id: `bot-dynamic-${Date.now()}`,
        senderId: speaker.id,
        senderName: speaker.name,
        senderAvatar: speaker.avatar || '🤖',
        isBot: true,
        text: chosenBanter,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDiscrepancyMention: speakerIsOutlier,
      };

      setChatMessages((prev) => [...prev, newMsg]);
      speakTextRef.current(`${speaker.name} says: ${chosenBanter}`);
    }, 12000);

    return () => clearInterval(interval);
  }, [timeLeft, isTimerPaused, playersList, discrepancies, getPlayerChoice]);

  // Auto-scroll chat window on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ---------------------------------------------------------------------------
  // 6. Countdown Timer Logic
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isTimerPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, timeLeft]);

  // Format timer into MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // ---------------------------------------------------------------------------
  // 7. Interactive Handlers
  // ---------------------------------------------------------------------------
  const toggleSuspectTag = (playerId) => {
    setTaggedSuspects((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      senderId: 'user',
      senderName: 'You (Agent)',
      senderAvatar: '🕵️‍♂️',
      isBot: false,
      isUser: true,
      text: userChatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setUserChatInput('');

    // Optional simulated bot reaction after user posts
    setTimeout(() => {
      const botPlayers = playersList.filter((p) => p.isBot);
      if (botPlayers.length > 0) {
        const respondingBot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
        const botReply = {
          id: `bot-reply-${Date.now()}`,
          senderId: respondingBot.id,
          senderName: respondingBot.name,
          senderAvatar: respondingBot.avatar || '🤖',
          isBot: true,
          text: `Noted, Agent! I'm keeping an eye on the suspect tags as well.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, botReply]);
        speakText(`${respondingBot.name} replies: Noted, Agent! I'm keeping an eye on the suspect tags as well.`);
      }
    }, 2500);
  };

  const handleProceedToVote = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (onProceedToVote) {
      onProceedToVote({
        taggedSuspects: Array.from(taggedSuspects),
        discrepancies: Array.from(discrepancies),
      });
    }
  };

  // ---------------------------------------------------------------------------
  // 8. Component Rendering
  // ---------------------------------------------------------------------------
  return (
    <div style={styles.container}>
      {/* Dynamic Keyframes and CSS Animations */}
      <style>{`
        @keyframes pulseGlowRed {
          0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.8), inset 0 0 15px rgba(239, 68, 68, 0.4); }
          100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2); }
        }
        @keyframes pulseGlowCyan {
          0% { box-shadow: 0 0 8px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.7); }
          100% { box-shadow: 0 0 8px rgba(6, 182, 212, 0.3); }
        }
        @keyframes scanlineAnim {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        .suspect-card-active {
          animation: pulseGlowRed 2s infinite ease-in-out;
          border-color: #ef4444 !important;
        }
        .discrepancy-card {
          border-color: #f59e0b !important;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.9)) !important;
        }
        .chat-message-bot {
          border-left: 3px solid #06b6d4;
        }
        .chat-message-discrepancy {
          border-left: 3px solid #f59e0b;
        }
        .btn-proceed:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.8) !important;
        }
        .seat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }
      `}</style>

      {/* Header Bar */}
      <header style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <span style={styles.headerIcon}>🛰️</span>
          <div>
            <h1 style={styles.headerTitle}>DISCUSSION & INTEL ANALYSIS</h1>
            <p style={styles.headerSub}>Cross-examine choices, spot discrepancies, and tag suspects</p>
          </div>
        </div>

        {/* Timer Box */}
        <div style={styles.timerBox}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={styles.timerLabel}>PHASE TIMER</span>
            <span style={{
              ...styles.timerValue,
              color: timeLeft <= 10 ? '#ef4444' : '#06b6d4',
              animation: timeLeft <= 10 ? 'pulseGlowRed 1s infinite' : 'none',
            }}>
              ⏱️ {formattedTime}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsTimerPaused(!isTimerPaused)}
            style={styles.pauseBtn}
            title={isTimerPaused ? "Resume Timer" : "Pause Timer"}
          >
            {isTimerPaused ? '▶️' : '⏸️'}
          </button>
        </div>
      </header>

      {/* Main Grid: Left Central Command Screen + Right Live Chat & Speech Controls */}
      <div style={styles.mainGrid}>
        
        {/* Left Side: Central Command Screen */}
        <section style={styles.commandScreen}>
          {/* Mission Objective Header */}
          <div style={styles.intelBanner}>
            <div style={styles.intelHeader}>
              <span style={styles.intelTag}>🔓 REVEALED INTEL QUESTION (OPEN TO ALL OPERATORS & SPY)</span>
              <span style={styles.intelStatusBadge}>
                {discrepancies.size > 0 ? '⚠️ DISCREPANCY DETECTED' : '✅ CONSENSUS REACHED'}
              </span>
            </div>
            <h2 style={styles.intelQuestion}>"{questionTitle}"</h2>
            <div style={{ fontSize: '0.85rem', color: '#3b82f6', margin: '4px 0 10px 0', fontFamily: 'Rajdhani', fontWeight: 600 }}>
              💡 <strong>Spy Defense Rule:</strong> The prompt is now revealed! Spies can see what the question was and try to bluff/explain their answer choice to blend in!
            </div>
            <div style={styles.breakdownBar}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Choice Breakdown:</span>
              {Object.entries(choiceCounts).map(([choice, count]) => {
                const percent = Math.round((count / totalAnswered) * 100);
                const isMajority = choice === majorityChoice;
                return (
                  <span
                    key={choice}
                    style={{
                      ...styles.choiceChip,
                      borderColor: isMajority ? '#06b6d4' : '#f59e0b',
                      color: isMajority ? '#3b82f6' : '#06b6d4',
                    }}
                  >
                    {choice}: <strong>{count}</strong> ({percent}%)
                  </span>
                );
              })}
            </div>
          </div>

          {/* Player Seats Side-by-Side Grid */}
          <div style={styles.seatsGridHeader}>
            <h3 style={styles.sectionTitle}>
              <span>👥 PLAYER SEATS & CHOICES</span>
              <span style={styles.suspectCountBadge}>
                {taggedSuspects.size} SUSPECT(S) TAGGED
              </span>
            </h3>
            <span style={styles.instructionHint}>💡 Click any seat card to flag/unflag as SUSPECT</span>
          </div>

          <div style={styles.seatsGrid}>
            {playersList.map((player, idx) => {
              const choice = getPlayerChoice(player, idx);
              const isSuspect = taggedSuspects.has(player.id);
              const isDiscrepancy = discrepancies.has(player.id);
              const isMajority = choice === majorityChoice && !isDiscrepancy;

              return (
                <div
                  key={player.id}
                  onClick={() => toggleSuspectTag(player.id)}
                  className={`seat-card ${isSuspect ? 'suspect-card-active' : ''} ${isDiscrepancy ? 'discrepancy-card' : ''}`}
                  style={{
                    ...styles.seatCard,
                    borderColor: isSuspect
                      ? '#ef4444'
                      : isDiscrepancy
                      ? '#f59e0b'
                      : isMajority
                      ? 'rgba(6, 182, 212, 0.4)'
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Suspect Reticle Overlay */}
                  {isSuspect && (
                    <div style={styles.suspectBanner}>
                      🎯 SUSPECT TAGGED
                    </div>
                  )}

                  {/* Player Header */}
                  <div style={styles.playerCardHeader}>
                    <div style={styles.avatarContainer}>
                      <RenderAvatar avatar={player.avatar || (player.isBot ? '🤖' : '🕵️')} size={40} />
                      {player.isBot && <span style={styles.botTag}>BOT</span>}
                    </div>
                    <div style={styles.playerInfo}>
                      <span style={styles.playerName}>{player.name}</span>
                      <span style={styles.playerRoleTag}>
                        {player.role ? `Role: ${player.role}` : 'Agent Seat'}
                      </span>
                    </div>
                  </div>

                  {/* Selected Choice Box */}
                  <div style={styles.choiceBox}>
                    <span style={styles.choiceLabel}>SELECTED CHOICE</span>
                    <span style={{
                      ...styles.choiceValue,
                      color: isDiscrepancy ? '#06b6d4' : isMajority ? '#3b82f6' : '#f8fafc',
                    }}>
                      {choice}
                    </span>
                  </div>

                  {/* Discrepancy Status Indicator */}
                  <div style={styles.statusFooter}>
                    {isDiscrepancy ? (
                      <span style={styles.discrepancyBadge}>
                        🚨 OUTLIER ANSWER
                      </span>
                    ) : isMajority ? (
                      <span style={styles.majorityBadge}>
                        ✔️ MAJORITY MATCH
                      </span>
                    ) : (
                      <span style={styles.neutralBadge}>
                        SELECTED
                      </span>
                    )}

                    <span style={{
                      ...styles.tagButton,
                      backgroundColor: isSuspect ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                      color: isSuspect ? '#ffffff' : '#cbd5e1',
                    }}>
                      {isSuspect ? 'FLAGGED 🚩' : '+ TAG SUSPECT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer Button */}
          <div style={styles.actionFooter}>
            <button
              type="button"
              onClick={handleProceedToVote}
              className="btn-proceed"
              style={styles.proceedButton}
            >
              <span>PROCEED TO VOTING PHASE 🗳️</span>
            </button>
          </div>
        </section>

        {/* Right Side: Live Discussion / AI Voice Speech & Chat */}
        <section style={styles.chatSection}>
          
          {/* Web Speech API Controls Header */}
          <div style={styles.speechControlPanel}>
            <div style={styles.speechHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🔊</span>
                <span style={styles.speechPanelTitle}>AI SPEECH INTERFACE</span>
              </div>
              <label style={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={speechEnabled}
                  onChange={(e) => setSpeechEnabled(e.target.checked)}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.toggleSwitch,
                  backgroundColor: speechEnabled ? '#06b6d4' : '#334155',
                }}>
                  <span style={{
                    ...styles.toggleKnob,
                    transform: speechEnabled ? 'translateX(18px)' : 'translateX(2px)',
                  }} />
                </span>
                <span style={{ fontSize: '0.85rem', color: speechEnabled ? '#3b82f6' : '#94a3b8', fontWeight: 600 }}>
                  {speechEnabled ? 'VOICE ON' : 'VOICE OFF'}
                </span>
              </label>
            </div>

            {/* Voice & Speed Selector */}
            {speechEnabled && (
              <div style={styles.speechSettingsGrid}>
                {voices.length > 0 && (
                  <div style={styles.settingField}>
                    <label style={styles.fieldLabel}>Voice Engine:</label>
                    <select
                      value={selectedVoiceIndex}
                      onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                      style={styles.selectInput}
                    >
                      {voices.map((v, i) => (
                        <option key={`${v.name}-${i}`} value={i}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={styles.settingField}>
                  <label style={styles.fieldLabel}>Speech Rate ({speechRate}x):</label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    style={styles.rangeInput}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Chat Feed Header */}
          <div style={styles.chatFeedHeader}>
            <span style={styles.chatTitle}>💬 LIVE BOT BANTER & DISCUSSIONS</span>
            <span style={styles.liveIndicator}>🟢 LIVE FEED</span>
          </div>

          {/* Chat Messages Log */}
          <div ref={chatContainerRef} style={styles.chatFeedContainer}>
            {chatMessages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} style={styles.systemMsgBox}>
                    <span>{msg.text}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.isBot ? 'chat-message-bot' : ''} ${msg.isDiscrepancyMention ? 'chat-message-discrepancy' : ''}`}
                  style={{
                    ...styles.chatBubble,
                    alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.isUser ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 41, 59, 0.8)',
                    borderColor: msg.isUser ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={styles.chatBubbleHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <RenderAvatar avatar={msg.senderAvatar} size={24} />
                      <span style={styles.senderName}>{msg.senderName}</span>
                      {msg.isBot && <span style={styles.miniBotTag}>AI</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={styles.msgTime}>{msg.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => speakText(`${msg.senderName} says: ${msg.text}`)}
                        style={styles.speakButton}
                        title="Read aloud"
                      >
                        🗣️
                      </button>
                    </div>
                  </div>

                  <p style={styles.chatMsgText}>{msg.text}</p>
                </div>
              );
            })}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendChatMessage} style={styles.chatForm}>
            <input
              type="text"
              placeholder="Type your comment or suspicion..."
              value={userChatInput}
              onChange={(e) => setUserChatInput(e.target.value)}
              style={styles.chatInput}
            />
            <button type="submit" style={styles.sendButton}>
              SEND 💬
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Styling Object (Glassmorphism & Cyberpunk Theme)
// -----------------------------------------------------------------------------
const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#0a1020',
    color: '#f8fafc',
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    fontSize: '2rem',
    background: 'rgba(6, 182, 212, 0.15)',
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid rgba(6, 182, 212, 0.3)',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerSub: {
    margin: '4px 0 0 0',
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  timerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: '10px 18px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  timerLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.1em',
  },
  timerValue: {
    fontSize: '1.4rem',
    fontWeight: 800,
    fontFamily: 'monospace',
  },
  pauseBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f8fafc',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '20px',
    flex: 1,
  },
  commandScreen: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  intelBanner: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  intelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intelTag: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#06b6d4',
    letterSpacing: '0.1em',
  },
  intelStatusBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#06b6d4',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  intelQuestion: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#f1f5f9',
  },
  breakdownBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  choiceChip: {
    fontSize: '0.8rem',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid',
  },
  seatsGridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    letterSpacing: '0.05em',
  },
  suspectCountBadge: {
    fontSize: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  instructionHint: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  seatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  seatCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.25s ease',
  },
  suspectBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: 800,
    textAlign: 'center',
    padding: '3px 0',
    letterSpacing: '0.1em',
  },
  playerCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  avatarContainer: {
    position: 'relative',
    fontSize: '1.8rem',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  botTag: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    fontSize: '0.65rem',
    fontWeight: 800,
    backgroundColor: '#06b6d4',
    color: '#0f172a',
    padding: '1px 4px',
    borderRadius: '4px',
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  playerName: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#f8fafc',
  },
  playerRoleTag: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  choiceBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  choiceLabel: {
    fontSize: '0.65rem',
    color: '#64748b',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  choiceValue: {
    fontSize: '0.95rem',
    fontWeight: 700,
  },
  statusFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '6px',
  },
  discrepancyBadge: {
    fontSize: '0.7rem',
    fontWeight: 800,
    color: '#06b6d4',
  },
  majorityBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#3b82f6',
  },
  neutralBadge: {
    fontSize: '0.7rem',
    color: '#94a3b8',
  },
  tagButton: {
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  actionFooter: {
    marginTop: 'auto',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  proceedButton: {
    width: '100%',
    padding: '16px',
    fontSize: '1.1rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
    transition: 'all 0.25s ease',
  },
  chatSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '20px',
    maxHeight: 'calc(100vh - 120px)',
  },
  speechControlPanel: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    borderRadius: '12px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  speechHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speechPanelTitle: {
    fontSize: '0.85rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    color: '#60a5fa',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  toggleInput: {
    display: 'none',
  },
  toggleSwitch: {
    width: '36px',
    height: '18px',
    borderRadius: '10px',
    display: 'inline-block',
    position: 'relative',
    transition: 'background-color 0.2s',
  },
  toggleKnob: {
    width: '14px',
    height: '14px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    transition: 'transform 0.2s',
  },
  speechSettingsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  settingField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
  },
  fieldLabel: {
    color: '#94a3b8',
  },
  selectInput: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    padding: '3px 6px',
    fontSize: '0.75rem',
    maxWidth: '180px',
  },
  rangeInput: {
    accentColor: '#06b6d4',
    width: '100px',
  },
  chatFeedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '8px',
  },
  chatTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#cbd5e1',
    letterSpacing: '0.05em',
  },
  liveIndicator: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#3b82f6',
  },
  chatFeedContainer: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '4px',
  },
  systemMsgBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    border: '1px dashed rgba(245, 158, 11, 0.4)',
    color: '#06b6d4',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    textAlign: 'center',
    fontWeight: 600,
  },
  chatBubble: {
    maxWidth: '90%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  chatBubbleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontWeight: 700,
    fontSize: '0.8rem',
    color: '#f8fafc',
  },
  miniBotTag: {
    fontSize: '0.6rem',
    backgroundColor: '#06b6d4',
    color: '#0f172a',
    padding: '0 4px',
    borderRadius: '3px',
    fontWeight: 800,
  },
  msgTime: {
    fontSize: '0.65rem',
    color: '#64748b',
  },
  speakButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0 2px',
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },
  chatMsgText: {
    margin: 0,
    fontSize: '0.85rem',
    lineHeight: '1.35',
    color: '#e2e8f0',
  },
  chatForm: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#f8fafc',
    fontSize: '0.85rem',
    outline: 'none',
  },
  sendButton: {
    backgroundColor: '#06b6d4',
    color: '#0f172a',
    border: 'none',
    borderRadius: '8px',
    padding: '0 14px',
    fontWeight: 800,
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default DiscussionPhase;
