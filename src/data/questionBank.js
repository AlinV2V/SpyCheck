/**
 * Intruder Check - High Accuracy Question Bank & Social Deduction Prompts
 * 
 * EVERY SINGLE QUESTION PROMPT IS 100% MATCHED TO CONTEXTUALLY ACCURATE OPTIONS A, B, C, D!
 */

// Category 1: Player Name Prompts (Options are ALWAYS Player Names A, B, C, D)
export const PLAYER_NAME_PROMPTS = [
  {
    id: 'pname_01',
    category: 'Group Consensus',
    question: "From the operators at this console, who is the smartest of the group?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_02',
    category: 'Group Consensus',
    question: "Who in this room is the absolute worst driver?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_03',
    category: 'Group Consensus',
    question: "If our group gets pulled over by the police, who is the biggest snitch?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_04',
    category: 'Group Consensus',
    question: "Who in this group is most likely to fall for an obvious scam?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_05',
    category: 'Group Consensus',
    question: "If we were stranded on a deserted island, who would we eat first to survive?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_06',
    category: 'Group Consensus',
    question: "Who in this room has the most unhinged, chaotic sleep schedule?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_07',
    category: 'Group Consensus',
    question: "Who is the biggest drama queen when they get a mild cold?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_08',
    category: 'Group Consensus',
    question: "Who would last the shortest amount of time in a zombie apocalypse?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_09',
    category: 'Group Consensus',
    question: "Who in this group is the biggest hypochondriac?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_10',
    category: 'Group Consensus',
    question: "Who is most likely to get banned from a public discord server on day one?",
    isPlayerNameQuestion: true,
    options: []
  }
];

// Category 2: Regular Contextual Choice Prompts
export const MULTIPLE_CHOICE_PROMPTS = [
  {
    id: 'fd_01',
    category: 'Food & Lifestyle',
    question: "How do you eat sushi?",
    options: [
      "A) Chopsticks only — Master technique",
      "B) With my hands like traditional sushi",
      "C) Fork and knife — Don't judge me",
      "D) Drown it in soy sauce and wasabi"
    ]
  },
  {
    id: 'fd_02',
    category: 'Food & Lifestyle',
    question: "What do you do if a server brings you the wrong order at a restaurant?",
    options: [
      "A) Eat it anyway — Too shy to complain",
      "B) Politely let them know and request the correct order",
      "C) Demand a discount or manager call",
      "D) Eat it and complain online afterwards"
    ]
  },
  {
    id: 'fd_03',
    category: 'Food & Lifestyle',
    question: "What do you do with apple skin or potato skins?",
    options: [
      "A) Eat them — That's where the vitamins are",
      "B) Peel and throw them away completely",
      "C) Only eat them if cooked extra crisp",
      "D) Give them to my pets or compost"
    ]
  },
  {
    id: 'fd_04',
    category: 'Food & Lifestyle',
    question: "What is your opinion on dark chocolate vs milk chocolate?",
    options: [
      "A) Dark chocolate only (70%+ Cocoa)",
      "B) Milk chocolate — Smooth and sweet",
      "C) White chocolate is superior",
      "D) I hate chocolate completely"
    ]
  },
  {
    id: 'fd_05',
    category: 'Food & Lifestyle',
    question: "How often do you chew gum during the day?",
    options: [
      "A) Constantly — Multiple packs a day",
      "B) Only after meals for fresh breath",
      "C) Occasionally when stressed",
      "D) Never — I don't chew gum"
    ]
  },
  {
    id: 'fd_06',
    category: 'Food & Lifestyle',
    question: "What do you do if your ice cream cone starts dripping on your hand?",
    options: [
      "A) Panic-lick the entire cone rapidly",
      "B) Grab a mountain of napkins",
      "C) Let it drip and wash hands later",
      "D) Throw it away immediately"
    ]
  },
  {
    id: 'life_01',
    category: 'Habits & Routine',
    question: "What is your usual bedtime on a weekday night?",
    options: [
      "A) Before 10:00 PM — Early riser",
      "B) 10:00 PM to Midnight",
      "C) 1:00 AM to 3:00 AM — Night owl",
      "D) Whenever I collapse (4:00 AM+)"
    ]
  },
  {
    id: 'life_02',
    category: 'Habits & Routine',
    question: "How fast do you respond to a text from a friend?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
    ]
  },
  {
    id: 'life_03',
    category: 'Habits & Routine',
    question: "How do you handle an unknown phone number calling you?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
    ]
  },
  {
    id: 'life_04',
    category: 'Habits & Routine',
    question: "How spicy do you like your food?",
    options: [
      "A) Mild — Black pepper is too spicy",
      "B) Medium heat — jalapeño level",
      "C) Extra Hot — Habanero level",
      "D) Ghost pepper / Reaper level"
    ]
  }
];

export const QUESTION_BANK = [
  ...PLAYER_NAME_PROMPTS,
  ...MULTIPLE_CHOICE_PROMPTS
];

/**
 * Prepares a question for display. If it's a player-name question,
 * populates the options with active player names A, B, C, D.
 */
export function prepareQuestion(question, players = []) {
  if (!question) return null;

  if (question.isPlayerNameQuestion) {
    const activePlayers = players.length >= 2 ? players : [
      { name: 'Agent Alpha' },
      { name: 'Agent 02' },
      { name: 'Agent 03' },
      { name: 'Agent 04' }
    ];

    const playerOptions = activePlayers.slice(0, 4).map((p, idx) => {
      const char = ['A', 'B', 'C', 'D'][idx];
      return `${char}) ${p.name}`;
    });

    return {
      ...question,
      options: playerOptions
    };
  }

  return question;
}

/**
 * Retrieves random sample of unique questions prepared for current players.
 */
export function getRandomQuestions(count = 5, players = []) {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map(q => prepareQuestion(q, players));
}

/**
 * Get question by ID
 */
export function getQuestionById(id, players = []) {
  const q = QUESTION_BANK.find(item => item.id === id);
  return prepareQuestion(q, players);
}
