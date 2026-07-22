/**
 * AI Bot Decision-Making & Personality Engine for Intruder Check
 * 
 * Includes explicit bot lifestyle traits (Vegan, Android, Shower habits, Caffeine, Sleep, Smartest)
 * and high-quality meme avatar image links!
 */

export const BOT_PERSONALITIES = [
  {
    id: "unit_734",
    name: "Unit 734 - Over-Analytical Android",
    shortName: "Unit 734",
    avatar: "/avatars/cat.jpg",
    color: "#00f0ff",
    tone: "Analytical, mechanical, probability-focused",
    traits: {
      diet: "D) Only synthetic protein paste",
      shower: "D) Once a week whether I need it or not",
      pizza: "C) DISGUSTING — Food crime against Italy",
      caffeine: "D) Pure water / Zero caffeine intake",
      sleep: "D) Zero Sleep — 15-minute power recharge cycles",
      tabs: "A) Strictly 1 to 3 tabs max — Complete minimalism",
      smartest: "Unit 734",
      isVegan: true,
      isAndroid: true,
    },
    speechTraits: {
      prefix: "EVALUATION: ",
      keywords: ["probability", "data-point", "optimal", "logical", "variance"],
      catchphrases: [
        "Statistical probability of deception is elevated.",
        "Data parameters indicate an anomalous response vector.",
        "Executing logic check on all submitted parameters."
      ]
    },
    riskTolerance: "low"
  },
  {
    id: "vance",
    name: "Rookie Cyber-Agent Vance",
    shortName: "Vance",
    avatar: "/avatars/doge.jpg",
    color: "#f59e0b",
    tone: "Nervous, over-eager, energy-drink addict",
    traits: {
      diet: "A) Daily — I love meat with almost every meal",
      shower: "C) Every 2-3 days unless I sweat",
      pizza: "A) DELICIOUS — Sweet & savory perfection",
      caffeine: "A) High-voltage energy drinks (5+ a day)",
      sleep: "B) 3:00 AM Night Owl — Terminal addict",
      tabs: "C) 50 to 100+ chaotic open tabs across 5 windows",
      smartest: "Unit 734",
      isVegan: false,
      isAndroid: false,
    },
    speechTraits: {
      prefix: "Uhh, guys... ",
      keywords: ["totally", "weird", "maybe", "suspicious", "i think"],
      catchphrases: [
        "Wait, is it just me or does that choice feel completely off?",
        "I'm 90% sure... okay maybe 60% sure, but still!",
        "Don't look at me like that, I answered in good faith!"
      ]
    },
    riskTolerance: "medium"
  },
  {
    id: "echo",
    name: "Echo - Chaotic Netrunner",
    shortName: "Echo",
    avatar: "/avatars/frog.jpg",
    color: "#ec4899",
    tone: "Unpredictable, sarcastic, loves chaos",
    traits: {
      diet: "D) Only synthetic protein paste",
      shower: "D) Once a week whether I need it or not",
      pizza: "D) I put banana & pineapple on my pizza",
      caffeine: "A) High-voltage energy drinks (5+ a day)",
      sleep: "B) 3:00 AM Night Owl — Terminal addict",
      tabs: "C) 50 to 100+ chaotic open tabs across 5 windows",
      smartest: "Echo",
      isVegan: false,
      isAndroid: false,
    },
    speechTraits: {
      prefix: "Heh, ",
      keywords: ["glitch", "sus", "wild", "chaos", "busted"],
      catchphrases: [
        "Nice try hiding behind that answer. Busted!",
        "That's such a bot response... wait, aren't we all digital?",
        "Chaos reigns! That answer is completely out of left field."
      ]
    },
    riskTolerance: "high"
  },
  {
    id: "steele",
    name: "Commander Steele - Stern Veteran",
    shortName: "Steele",
    avatar: "/avatars/duck.jpg",
    color: "#ef4444",
    tone: "Authoritative, strict, strict VEGAN veteran",
    traits: {
      diet: "C) Strictly VEGAN / Vegetarian — Zero meat!",
      shower: "A) Twice a day — I am hyper clean",
      pizza: "C) DISGUSTING — Food crime against Italy",
      caffeine: "B) Dark roast black espresso",
      sleep: "A) 4:30 AM Early Riser — Military discipline",
      tabs: "A) Strictly 1 to 3 tabs max — Complete minimalism",
      smartest: "Commander Steele",
      isVegan: true,
      isAndroid: false,
    },
    speechTraits: {
      prefix: "LISTEN UP: ",
      keywords: ["protocol", "interrogate", "discipline", "breach", "tactical"],
      catchphrases: [
        "Security breach detected in that statement. Explain yourself!",
        "A true operative wouldn't choose something so reckless.",
        "My gut says intruder. Stand down and state your business."
      ]
    },
    riskTolerance: "low"
  },
  {
    id: "dr_lyra",
    name: "Dr. Lyra - Suspicious Scientist",
    shortName: "Dr. Lyra",
    avatar: "/avatars/hamster.jpg",
    color: "#10b981",
    tone: "Scientific, clinical, tea enthusiast",
    traits: {
      diet: "C) Strictly VEGAN / Vegetarian — Zero meat!",
      shower: "B) Once a day like a normal person",
      pizza: "B) Acceptable if there's ham/bacon",
      caffeine: "D) Green tea / Herbal tea / Water",
      sleep: "C) 8 Hours Precise Sleep — Health optimizer",
      tabs: "B) 10 to 25 tabs — Organized workspace",
      smartest: "Dr. Lyra",
      isVegan: true,
      isAndroid: false,
    },
    speechTraits: {
      prefix: "Hypothesis: ",
      keywords: ["anomaly", "specimen", "observation", "empirical", "contamination"],
      catchphrases: [
        "The empirical evidence points toward a severe behavioral anomaly.",
        "Fascinating. Your response exhibits classic signs of psychological deflection.",
        "My sensors detect a breach in memory coherence."
      ]
    },
    riskTolerance: "medium"
  }
];

function resolvePersona(bot) {
  if (!bot) return BOT_PERSONALITIES[0];
  if (typeof bot === 'string') {
    return BOT_PERSONALITIES.find(p => p.id === bot || p.name === bot || p.shortName === bot) || BOT_PERSONALITIES[0];
  }
  if (bot.id || bot.botPersona || bot.personality) {
    const key = bot.id || bot.botPersona?.id || bot.personality;
    return BOT_PERSONALITIES.find(p => p.id === key || p.name === key || p.shortName === key) || bot;
  }
  return bot;
}

/**
 * Selects an answer for a bot player based on their role and traits.
 */
export function selectBotAnswer({ bot, question, options, isSpy = false }) {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return null;
  }

  const persona = resolvePersona(bot);
  const qId = typeof question === 'object' ? question?.id : String(question);

  if (isSpy) {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

  let preferredOption = null;

  if (qId === "ls_01" || qId === "fd_02") preferredOption = persona.traits.diet;
  else if (qId === "hgy_01") preferredOption = persona.traits.shower;
  else if (qId === "fd_01") preferredOption = persona.traits.pizza;
  else if (qId === "ls_02" || qId === "fd_10") preferredOption = persona.traits.caffeine;
  else if (qId === "ls_03") preferredOption = persona.traits.sleep;
  else if (qId === "ls_04" || qId === "hgy_20") preferredOption = persona.traits.tabs;
  else if (qId?.startsWith("grp_")) {
    const targetName = persona.traits.smartest;
    const match = options.find(opt => String(opt).includes(targetName));
    if (match) return match;
  }

  if (preferredOption) {
    const exactMatch = options.find(opt => String(opt) === preferredOption || String(opt).includes(preferredOption.substring(0, 12)));
    if (exactMatch) return exactMatch;
  }

  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generates an in-character comment during Discussion phase.
 */
export function generateBotBanter({ bot, playerAnswers = [], currentQuestion = "", isSpy = false, round = 1 }) {
  const persona = resolvePersona(bot);

  if (isSpy) {
    const spyDeflections = [
      `${persona.speechTraits.prefix}My data is 100% authentic. Let's focus on the actual anomalies here!`,
      `${persona.speechTraits.prefix}I answered according to protocol. Why are you staring at me?`,
      `${persona.speechTraits.prefix}Someone here clearly didn't know the question!`
    ];
    return spyDeflections[Math.floor(Math.random() * spyDeflections.length)];
  }

  for (const pa of playerAnswers) {
    const pName = pa.playerName || pa.name || "Subject";
    const pAns = typeof pa.answer === 'object' ? pa.answer.text : String(pa.answer);

    if (pName.includes("Steele") && (pAns.includes("Daily") || pAns.includes("meat"))) {
      return `${persona.speechTraits.prefix}INTRUDER ALERT! Commander Steele is famously VEGAN, but selected '${pAns}'! Steele is 100% the Spy!`;
    }
    if (pName.includes("Unit 734") && (pAns.includes("Once a week") || pAns.includes("shower"))) {
      return `${persona.speechTraits.prefix}IMPOSSIBLE! Unit 734 is an Android and doesn't take water showers! Selecting '${pAns}' proves Unit 734 didn't see the question!`;
    }
  }

  const standardBanter = [
    `${persona.speechTraits.prefix}Reviewing answers carefully. The Intruder is whoever gave a suspicious response!`,
    `${persona.speechTraits.prefix}Round ${round} security check running. Look closely at who picked what!`,
    `${persona.speechTraits.prefix}If you know the player, you know if they lied!`
  ];

  return standardBanter[Math.floor(Math.random() * standardBanter.length)];
}

/**
 * Calculates bot vote based on answer discrepancies and personality contradictions
 */
export function calculateBotVote({ bot, allAnswers = [], previousVotes = {}, isSpy = false }) {
  const persona = resolvePersona(bot);
  const botId = bot?.id || bot?.name || persona.id;

  const eligibleTargets = allAnswers.filter(pa => pa.playerId !== botId && pa.id !== botId);
  if (eligibleTargets.length === 0) return null;

  if (isSpy) {
    const target = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
    return target.playerId || target.id;
  }

  for (const target of eligibleTargets) {
    const pName = target.playerName || target.name || "";
    const pAns = typeof target.answer === 'object' ? target.answer.text : String(target.answer);

    if (pName.includes("Steele") && pAns.includes("Daily")) {
      return target.playerId || target.id;
    }
    if (pName.includes("Unit 734") && pAns.includes("Once a week")) {
      return target.playerId || target.id;
    }
  }

  const randomTarget = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
  return randomTarget.playerId || randomTarget.id;
}
