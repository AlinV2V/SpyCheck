/**
 * Room State Machine & Utility Functions for SpyCheck
 */

export const GAME_MODES = {
  SOLO_AI: 'solo_ai',
  PASS_PLAY: 'pass_play',
  LOCAL_P2P: 'local_p2p'
};

export const GAME_PHASES = {
  LOBBY: 'lobby',
  QUESTION: 'question',
  DISCUSSION: 'discussion',
  VOTING: 'voting',
  RESOLUTION: 'resolution',
  GAMEOVER: 'gameover'
};

// Default sample question bank for game rounds
export const SAMPLE_QUESTIONS = [
  {
    id: 'q1',
    category: 'Lifestyle',
    text: 'What is your absolute favorite weekend morning activity?',
    options: ['Sleeping in late', 'Going for a run/workout', 'Brewing coffee & reading', 'Brunching with friends']
  },
  {
    id: 'q2',
    category: 'Travel',
    text: 'Where would you prefer to spend a dream vacation?',
    options: ['Tropical Beach Resort', 'Historic European City', 'Mountain Cabin & Hiking', 'Futuristic Cyberpunk Metropolis']
  },
  {
    id: 'q3',
    category: 'Food',
    text: 'If you could only eat one cuisine for the rest of your life, what is it?',
    options: ['Italian (Pasta/Pizza)', 'Japanese (Sushi/Ramen)', 'Mexican (Tacos/Burritos)', 'Indian (Curries/Naan)']
  },
  {
    id: 'q4',
    category: 'Superpowers',
    text: 'Which superpower would you choose to have?',
    options: ['Invisibility', 'Flight', 'Teleportation', 'Time Travel']
  },
  {
    id: 'q5',
    category: 'Entertainment',
    text: 'What is your preferred movie genre for movie night?',
    options: ['Sci-Fi / Fantasy', 'Action / Thriller', 'Comedy', 'Horror / Mystery']
  }
];

/**
 * Generate random 6-character room code
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create initial empty room state
 */
export function createRoomState(config = {}) {
  return {
    roomCode: config.roomCode || generateRoomCode(),
    mode: config.mode || GAME_MODES.SOLO_AI,
    players: config.players || [], // [{ id, name, isAI, avatar, score, isHost }]
    currentRound: config.currentRound !== undefined ? config.currentRound : 1,
    currentPhase: config.currentPhase || GAME_PHASES.QUESTION,
    spyIndex: config.spyIndex !== undefined ? config.spyIndex : null,
    currentQuestion: config.currentQuestion || null,
    playerAnswers: {}, // playerId -> answerIndex
    playerVotes: {},   // voterId -> targetId
    roundHistory: [],
    timerSeconds: config.timerSeconds || 45,
    timer: config.timerSeconds || 45,
    winner: null // 'agents' | 'spy' | null
  };
}

/**
 * Start/Initialize a new game run
 */
export function startGame(state, questionPool = SAMPLE_QUESTIONS) {
  if (!state.players || state.players.length < 3) {
    throw new Error('Game requires at least 3 players.');
  }

  // Pick random spy
  const spyIndex = Math.floor(Math.random() * state.players.length);

  // Pick random question from pool
  const question = questionPool[Math.floor(Math.random() * questionPool.length)];

  return {
    ...state,
    currentRound: 1,
    currentPhase: GAME_PHASES.QUESTION,
    spyIndex: spyIndex,
    currentQuestion: question,
    playerAnswers: {},
    playerVotes: {},
    roundHistory: [],
    timer: 30, // 30s timer for question phase
    winner: null
  };
}

/**
 * Role Secrecy: Sanitizes public state for a specific player index.
 * Ensures the Spy player receives null/hidden question text while preserving options.
 * Also hides spyIndex identity from non-resolution/non-gameover phases.
 */
export function getPublicStateForPlayer(state, playerIndex) {
  if (!state) return null;

  const isSpy = state.spyIndex !== null && playerIndex === state.spyIndex;
  const isGameOverOrResolution = [GAME_PHASES.RESOLUTION, GAME_PHASES.GAMEOVER].includes(state.currentPhase);

  // Deep clone state to prevent accidental state mutation
  const publicState = JSON.parse(JSON.stringify(state));

  // Hide true spyIndex unless phase is resolution or gameover
  if (!isGameOverOrResolution) {
    publicState.spyIndex = null;
  }

  // Role Secrecy: Spy receives null question text, only options!
  if (isSpy && publicState.currentQuestion) {
    publicState.currentQuestion = {
      ...publicState.currentQuestion,
      text: null,
      isSpyView: true
    };
  }

  return publicState;
}

/**
 * Process a player's answer submission
 */
export function processAnswer(state, playerId, answerIndex) {
  if (state.currentPhase !== GAME_PHASES.QUESTION) {
    return state;
  }

  const updatedAnswers = {
    ...state.playerAnswers,
    [playerId]: answerIndex
  };

  const newState = {
    ...state,
    playerAnswers: updatedAnswers
  };

  // Check if all players answered
  const allAnswered = newState.players.every(p => updatedAnswers[p.id] !== undefined);

  if (allAnswered) {
    return advancePhase(newState);
  }

  return newState;
}

/**
 * Process a player's vote
 */
export function processVote(state, voterId, targetId) {
  if (state.currentPhase !== GAME_PHASES.VOTING) {
    return state;
  }

  const updatedVotes = {
    ...state.playerVotes,
    [voterId]: targetId
  };

  const newState = {
    ...state,
    playerVotes: updatedVotes
  };

  // Check if all players voted
  const allVoted = newState.players.every(p => updatedVotes[p.id] !== undefined);

  if (allVoted) {
    return advancePhase(newState);
  }

  return newState;
}

/**
 * Tally votes to determine vote distribution and accused player
 */
export function tallyVotes(state) {
  const voteCounts = {};
  const votes = state.playerVotes || {};

  Object.values(votes).forEach(targetId => {
    if (targetId) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
  });

  let maxVotes = 0;
  let votedOutPlayerId = null;
  let isTie = false;

  Object.entries(voteCounts).forEach(([playerId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      votedOutPlayerId = playerId;
      isTie = false;
    } else if (count === maxVotes && maxVotes > 0) {
      isTie = true;
    }
  });

  return {
    voteCounts,
    votedOutPlayerId: isTie ? null : votedOutPlayerId,
    maxVotes,
    isTie
  };
}

/**
 * Check win condition logic:
 * - Agents win if Spy is voted out in resolution.
 * - Spy wins if surviving round 3.
 */
export function checkWinCondition(state, tallyResult) {
  if (!state.players || state.spyIndex === null) return null;

  const spyId = state.players[state.spyIndex]?.id;

  // Condition 1: Spy voted out -> Agents Win!
  if (tallyResult && tallyResult.votedOutPlayerId === spyId) {
    return 'agents';
  }

  // Condition 2: Spy survived round 3 -> Spy Wins!
  if (state.currentRound >= 3 && state.currentPhase === GAME_PHASES.RESOLUTION) {
    return 'spy';
  }

  return null;
}

/**
 * Advance state to the next game phase
 */
export function advancePhase(state, questionPool = SAMPLE_QUESTIONS) {
  switch (state.currentPhase) {
    case GAME_PHASES.LOBBY:
      return startGame(state, questionPool);

    case GAME_PHASES.QUESTION:
      return {
        ...state,
        currentPhase: GAME_PHASES.DISCUSSION,
        timer: 60 // 60s discussion period
      };

    case GAME_PHASES.DISCUSSION:
      return {
        ...state,
        currentPhase: GAME_PHASES.VOTING,
        timer: 30 // 30s voting period
      };

    case GAME_PHASES.VOTING: {
      const tally = tallyVotes(state);
      const winner = checkWinCondition(state, tally);

      const roundSummary = {
        roundNumber: state.currentRound,
        question: state.currentQuestion,
        answers: state.playerAnswers,
        votes: state.playerVotes,
        tally: tally,
        eliminatedPlayerId: tally.votedOutPlayerId
      };

      const newHistory = [...state.roundHistory, roundSummary];

      if (winner) {
        return {
          ...state,
          currentPhase: GAME_PHASES.GAMEOVER,
          roundHistory: newHistory,
          winner: winner,
          timer: 0
        };
      }

      return {
        ...state,
        currentPhase: GAME_PHASES.RESOLUTION,
        roundHistory: newHistory,
        timer: 15 // 15s resolution period
      };
    }

    case GAME_PHASES.RESOLUTION: {
      const nextRound = state.currentRound + 1;

      if (nextRound > 3) {
        return {
          ...state,
          currentPhase: GAME_PHASES.GAMEOVER,
          winner: 'spy', // Spy survived all 3 rounds
          timer: 0
        };
      }

      // Select next question
      const usedQuestionIds = new Set(state.roundHistory.map(r => r.question?.id));
      const availableQuestions = questionPool.filter(q => !usedQuestionIds.has(q.id));
      const nextQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)] || questionPool[0];

      return {
        ...state,
        currentRound: nextRound,
        currentPhase: GAME_PHASES.QUESTION,
        currentQuestion: nextQuestion,
        playerAnswers: {},
        playerVotes: {},
        timer: 30
      };
    }

    default:
      return state;
  }
}
