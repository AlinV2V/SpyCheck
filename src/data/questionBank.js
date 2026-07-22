/**
 * Intruder Check - Strict Deduction Question Bank (200+ Prompt Database)
 * 
 * GOLD RULES FOR SPY CHECK GAMEPLAY:
 * 1. ZERO KEYWORD LEAKS: Answer choices MUST NOT contain specific prompt keywords that leak topic to the Spy!
 * 2. PLAYER-NAME PROMPTS: Prompts where choices A, B, C, D are active player names.
 * 3. GENERIC PERSONALITY PROMPTS: Choices are generic frequencies, social reactions, or lifestyle habits.
 */

// Category 1: Player Name Prompts (80 Questions - Options are ALWAYS Player Names A, B, C, D)
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
    question: "Who in this group would last the SHORTEST amount of time in prison?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_09',
    category: 'Group Consensus',
    question: "Who in this room takes the longest to text back?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_10',
    category: 'Group Consensus',
    question: "Who is most likely to accidentally set off a fire alarm while cooking?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_11',
    category: 'Group Consensus',
    question: "Who in this group spends the most money on impulse buys?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_12',
    category: 'Group Consensus',
    question: "Who is secretly the biggest lightweight when drinking?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_13',
    category: 'Group Consensus',
    question: "Who in this room would fail a basic 5th-grade math test right now?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_14',
    category: 'Group Consensus',
    question: "Who would be the absolute worst roommate to live with?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_15',
    category: 'Group Consensus',
    question: "Who in this group is most likely to marry a stranger on a dare?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_16',
    category: 'Group Consensus',
    question: "Who in this room has the highest daily screen time on their phone?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_17',
    category: 'Group Consensus',
    question: "Who is the first person to panic if the power goes out?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_18',
    category: 'Group Consensus',
    question: "Who is most likely to fake their own death to get out of a bad date?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_19',
    category: 'Group Consensus',
    question: "Who in this group is the worst secret keeper?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_20',
    category: 'Group Consensus',
    question: "Who would die first in a zombie apocalypse?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_21',
    category: 'Group Consensus',
    question: "Who in this room has the messiest bedroom right now?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_22',
    category: 'Group Consensus',
    question: "Who is most likely to try talking their way out of a ticket and fail?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_23',
    category: 'Group Consensus',
    question: "Who in this group is most likely to stalk an ex at 3 AM?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_24',
    category: 'Group Consensus',
    question: "Who in this room spends the most time arguing in internet comments?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_25',
    category: 'Group Consensus',
    question: "Who is secretly hiding a multi-millionaire fortune?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_26',
    category: 'Group Consensus',
    question: "Who in this group would be the first to sell out the team to alien invaders?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_27',
    category: 'Group Consensus',
    question: "Who is most likely to spend their life savings on a worthless NFT or meme stock?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_28',
    category: 'Group Consensus',
    question: "Who in this room gives the absolute worst advice?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_29',
    category: 'Group Consensus',
    question: "Who is most likely to laugh at the worst possible moment during a sad scene?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_30',
    category: 'Group Consensus',
    question: "Who in this room is most likely to get kicked out of an all-you-can-eat buffet?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_31',
    category: 'Group Consensus',
    question: "Who in this group is the biggest hypochondriac?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_32',
    category: 'Group Consensus',
    question: "Who is most likely to get lost even while using Google Maps?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_33',
    category: 'Group Consensus',
    question: "Who in this room is most likely to show up 2 hours late with an iced coffee?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_34',
    category: 'Group Consensus',
    question: "Who would make the absolute worst U.S. President?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_35',
    category: 'Group Consensus',
    question: "Who in this group spends the longest time sitting in the bathroom on their phone?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_36',
    category: 'Group Consensus',
    question: "Who is most likely to trip on a flat, even surface?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_37',
    category: 'Group Consensus',
    question: "Who in this room has the most embarrassing search history right now?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_38',
    category: 'Group Consensus',
    question: "Who is most likely to start a fight with an automated voice recording?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_39',
    category: 'Group Consensus',
    question: "Who in this group is most likely to accidentally reply-all to a massive work email?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_40',
    category: 'Group Consensus',
    question: "Who is most likely to bring a guitar to a party and start playing uninvited?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_41',
    category: 'Group Consensus',
    question: "Who in this room has the worst fashion sense when staying at home?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_42',
    category: 'Group Consensus',
    question: "Who is most likely to accidentally leak their own password on a stream?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_43',
    category: 'Group Consensus',
    question: "Who in this group is most likely to live in their parents basement until age 40?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_44',
    category: 'Group Consensus',
    question: "Who would be the absolute first to get eliminated on Reality TV?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_45',
    category: 'Group Consensus',
    question: "Who in this room is the most aggressive driver when stuck in traffic?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_46',
    category: 'Group Consensus',
    question: "Who is most likely to cry during an animated Disney movie?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_47',
    category: 'Group Consensus',
    question: "Who in this group has the highest body count of burnt meals?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_48',
    category: 'Group Consensus',
    question: "Who would be the worst person to trust with your unlocked phone for 10 minutes?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_49',
    category: 'Group Consensus',
    question: "Who in this room is most likely to join a cult by accident?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_50',
    category: 'Group Consensus',
    question: "Who is most likely to forget where they parked their car in a multi-story lot?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_51',
    category: 'Group Consensus',
    question: "Who in this group spends the most time staring at themselves in the mirror?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_52',
    category: 'Group Consensus',
    question: "Who is most likely to adopt 15 cats and become a hermit?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_53',
    category: 'Group Consensus',
    question: "Who in this room eats fast food for 80 percent of their daily meals?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_54',
    category: 'Group Consensus',
    question: "Who is most likely to lie about reading the Terms & Conditions?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_55',
    category: 'Group Consensus',
    question: "Who in this group would be the absolute worst undercover FBI agent?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_56',
    category: 'Group Consensus',
    question: "Who is most likely to drop their phone directly onto their own face while lying in bed?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_57',
    category: 'Group Consensus',
    question: "Who in this room is the biggest sore loser when losing a board game?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_58',
    category: 'Group Consensus',
    question: "Who is most likely to accidentally lock themselves out of their own apartment?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_59',
    category: 'Group Consensus',
    question: "Who in this group is most likely to leave someone on read for 3 weeks?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_60',
    category: 'Group Consensus',
    question: "Who would be the first person to call their mom if stuck in a light storm?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_61',
    category: 'Group Consensus',
    question: "Who in this room is most likely to order the exact same item at every restaurant forever?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_62',
    category: 'Group Consensus',
    question: "Who is most likely to get banned from a public discord server on day one?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_63',
    category: 'Group Consensus',
    question: "Who in this group has the worst sleepwalking or talking in sleep habits?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_64',
    category: 'Group Consensus',
    question: "Who would be the most suspicious-looking person at airport security?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_65',
    category: 'Group Consensus',
    question: "Who in this room spends the most money on mobile microtransactions?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_66',
    category: 'Group Consensus',
    question: "Who is most likely to get scammed by a fake hot singles in your area popup?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_67',
    category: 'Group Consensus',
    question: "Who in this group would be the absolute worst driver in a getaway car?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_68',
    category: 'Group Consensus',
    question: "Who is most likely to get locked inside a public restroom?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_69',
    category: 'Group Consensus',
    question: "Who in this room is most likely to accidentally spill a full glass of water on their keyboard?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_70',
    category: 'Group Consensus',
    question: "Who is most likely to forget their own anniversary or birthday?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_71',
    category: 'Group Consensus',
    question: "Who in this group is most likely to wear pajamas to a formal job interview?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_72',
    category: 'Group Consensus',
    question: "Who would last the longest in a box with 1,000 harmless spiders?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_73',
    category: 'Group Consensus',
    question: "Who in this room is most likely to eat food off the floor past the 5-second rule?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_74',
    category: 'Group Consensus',
    question: "Who is most likely to get caught talking to themselves in public?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_75',
    category: 'Group Consensus',
    question: "Who in this group has the most unhinged sleep posture?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_76',
    category: 'Group Consensus',
    question: "Who would be the first to break down if internet was turned off for a month?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_77',
    category: 'Group Consensus',
    question: "Who in this room is most likely to buy a useless gimmick item off a late-night TV ad?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_78',
    category: 'Group Consensus',
    question: "Who is most likely to give a fake name at Starbucks just for fun?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_79',
    category: 'Group Consensus',
    question: "Who in this group is the biggest loud snorer?",
    isPlayerNameQuestion: true,
    options: []
  },
  {
    id: 'pname_80',
    category: 'Group Consensus',
    question: "Who is most likely to be secretly operating a meme page with 100k followers?",
    isPlayerNameQuestion: true,
    options: []
  }
];

// Category 2: Hygiene & Daily Schedule (40 Questions)
export const HYGIENE_SCHEDULE_PROMPTS = [
  {
    id: 'hgy_01',
    category: 'Personal Habits',
    question: "Be honest: how often do you take a full shower?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'hgy_02',
    category: 'Personal Habits',
    question: "How many days in a row do you re-wear the exact same hoodie or pants?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'hgy_03',
    category: 'Personal Habits',
    question: "What time do you usually wake up on weekends?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'hgy_04',
    category: 'Personal Habits',
    question: "How often do you change or wash your bedsheets?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'hgy_05',
    category: 'Personal Habits',
    question: "How many snooze buttons do you press on your morning alarm?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'hgy_06',
    category: 'Personal Habits',
    question: "How often do you floss your teeth?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'hgy_07',
    category: 'Personal Habits',
    question: "How clean is the floor of your bedroom right now?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'hgy_08',
    category: 'Personal Habits',
    question: "How often do you wash your winter jacket or heavy coats?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'hgy_09',
    category: 'Personal Habits',
    question: "What do you do when you drop a piece of food on a clean kitchen floor?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'hgy_10',
    category: 'Personal Habits',
    question: "How often do you clean your computer keyboard or phone screen?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'hgy_11',
    category: 'Personal Habits',
    question: "How long can you go without checking your phone when awake?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'hgy_12',
    category: 'Personal Habits',
    question: "How often do you wash your bath towel?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'hgy_13',
    category: 'Personal Habits',
    question: "How often do you clean out your refrigerator of expired food?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'hgy_14',
    category: 'Personal Habits',
    question: "How often do you brush your hair or groom in the morning?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'hgy_15',
    category: 'Personal Habits',
    question: "What is your shower temperature setting?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'hgy_16',
    category: 'Personal Habits',
    question: "How many unread emails are sitting in your inbox right now?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'hgy_17',
    category: 'Personal Habits',
    question: "How often do you cut or trim your fingernails?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'hgy_18',
    category: 'Personal Habits',
    question: "How many browser tabs do you have open on your computer right now?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'hgy_19',
    category: 'Personal Habits',
    question: "What is your usual bedtime on a weekday night?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'hgy_20',
    category: 'Personal Habits',
    question: "How often do you eat meals while sitting in your bed?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'hgy_21',
    category: 'Personal Habits',
    question: "How many times a day do you check yourself out in the mirror?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'hgy_22',
    category: 'Personal Habits',
    question: "How often do you do your laundry?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'hgy_23',
    category: 'Personal Habits',
    question: "How long does a pair of socks last before you throw them away?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'hgy_24',
    category: 'Personal Habits',
    question: "How often do you take nap during the middle of the day?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'hgy_25',
    category: 'Personal Habits',
    question: "How clean is the inside of your car or backpack right now?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'hgy_26',
    category: 'Personal Habits',
    question: "How often do you buy new shoes?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'hgy_27',
    category: 'Personal Habits',
    question: "What is your phone battery percentage right now?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'hgy_28',
    category: 'Personal Habits',
    question: "How often do you drink a full glass of plain water?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'hgy_29',
    category: 'Personal Habits',
    question: "How often do you change your toothbrush?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'hgy_30',
    category: 'Personal Habits',
    question: "How long do you stay in the shower just staring at the wall?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'hgy_31',
    category: 'Personal Habits',
    question: "How often do you clean your earwax?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'hgy_32',
    category: 'Personal Habits',
    question: "How many pairs of shoes do you own in total?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'hgy_33',
    category: 'Personal Habits',
    question: "How often do you leave dirty dishes sitting in the sink overnight?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'hgy_34',
    category: 'Personal Habits',
    question: "How often do you vacuum or sweep your living space?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'hgy_35',
    category: 'Personal Habits',
    question: "How many cups of coffee or caffeine drinks do you have daily?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'hgy_36',
    category: 'Personal Habits',
    question: "How often do you check your social media notifications?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'hgy_37',
    category: 'Personal Habits',
    question: "How long do you spend picking out an outfit in the morning?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'hgy_38',
    category: 'Personal Habits',
    question: "How often do you forget where you put your keys or wallet?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'hgy_39',
    category: 'Personal Habits',
    question: "How often do you wash your hands after touching public door handles?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'hgy_40',
    category: 'Personal Habits',
    question: "How long do you sit on the toilet scrolling on your phone?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  }
];

// Category 3: Social Behavior & Personal Life (40 Questions)
export const SOCIAL_BEHAVIOR_PROMPTS = [
  {
    id: 'soc_01',
    category: 'Social Preferences',
    question: "How fast do you respond to a text from a friend?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'soc_02',
    category: 'Social Preferences',
    question: "What is your reaction when an unknown phone number calls you?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'soc_03',
    category: 'Social Preferences',
    question: "How do you feel about attending large parties where you know nobody?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'soc_04',
    category: 'Social Preferences',
    question: "How many unread notifications do you have on your phone right now?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'soc_05',
    category: 'Social Preferences',
    question: "What do you do if a server brings you the wrong order at a restaurant?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'soc_06',
    category: 'Social Preferences',
    question: "How often do you cancel plans last minute to stay home?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'soc_07',
    category: 'Social Preferences',
    question: "How do you handle someone spoiling a movie or show for you?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'soc_08',
    category: 'Social Preferences',
    question: "How much do you tip a food delivery driver?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'soc_09',
    category: 'Social Preferences',
    question: "How do you react when someone takes a photo of you without warning?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'soc_10',
    category: 'Social Preferences',
    question: "What is your go-to response in an awkward elevator silence?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'soc_11',
    category: 'Social Preferences',
    question: "How often do you post stories on Instagram or social media?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'soc_12',
    category: 'Social Preferences',
    question: "What do you do if a stranger starts talking to you in a line?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'soc_13',
    category: 'Social Preferences',
    question: "How do you react when you see a former classmate in public?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'soc_14',
    category: 'Social Preferences',
    question: "How long can you survive in a room with zero small talk?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'soc_15',
    category: 'Social Preferences',
    question: "How often do you mute group chats on your phone?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'soc_16',
    category: 'Social Preferences',
    question: "What is your policy on sharing food with friends?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'soc_17',
    category: 'Social Preferences',
    question: "How do you react when someone leaves you on read for 24 hours?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'soc_18',
    category: 'Social Preferences',
    question: "What do you do if someone sings Happy Birthday to you in public?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'soc_19',
    category: 'Social Preferences',
    question: "How often do you make new friends online vs real life?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'soc_20',
    category: 'Social Preferences',
    question: "What is your reaction when someone borrows your clothes?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'soc_21',
    category: 'Social Preferences',
    question: "How do you feel about voice notes instead of text messages?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'soc_22',
    category: 'Social Preferences',
    question: "What do you do if you forget someone name right after meeting them?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'soc_23',
    category: 'Social Preferences',
    question: "How often do you stalk people on social media out of boredom?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'soc_24',
    category: 'Social Preferences',
    question: "How do you react when someone cuts in front of you in line?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'soc_25',
    category: 'Social Preferences',
    question: "How often do you use emojis when texting?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'soc_26',
    category: 'Social Preferences',
    question: "What do you do if your friend has spinach stuck in their teeth?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'soc_27',
    category: 'Social Preferences',
    question: "How do you handle getting lost in a city with friends?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'soc_28',
    category: 'Social Preferences',
    question: "What do you do if someone gives you a terrible gift you hate?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'soc_29',
    category: 'Social Preferences',
    question: "How often do you double-text if someone does not reply?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'soc_30',
    category: 'Social Preferences',
    question: "How do you react when a pet comes up to you in public?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'soc_31',
    category: 'Social Preferences',
    question: "What is your policy on holding the door for someone far away?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'soc_32',
    category: 'Social Preferences',
    question: "How do you handle being placed in a group project with randoms?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'soc_33',
    category: 'Social Preferences',
    question: "How often do you listen to music with headphones in public?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'soc_34',
    category: 'Social Preferences',
    question: "What do you do if you notice your phone battery is at 1 percent?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'soc_35',
    category: 'Social Preferences',
    question: "How do you react when someone spoils a game twist for you?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'soc_36',
    category: 'Social Preferences',
    question: "What do you do if you drop a drink in front of a crowd?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'soc_37',
    category: 'Social Preferences',
    question: "How often do you re-watch your favorite show instead of new ones?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'soc_38',
    category: 'Social Preferences',
    question: "What is your policy on taking home leftovers from a restaurant?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'soc_39',
    category: 'Social Preferences',
    question: "How do you handle someone waving at you who was actually waving to someone behind you?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'soc_40',
    category: 'Social Preferences',
    question: "How often do you sing out loud in the shower or car?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  }
];

// Category 4: Food & Lifestyle Scenarios (40 Questions)
export const FOOD_LIFESTYLE_PROMPTS = [
  {
    id: 'fd_01',
    category: 'Food & Lifestyle',
    question: "How often do you order food delivery (UberEats or DoorDash) per week?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'fd_02',
    category: 'Food & Lifestyle',
    question: "How often do you eat fast food meat?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'fd_03',
    category: 'Food & Lifestyle',
    question: "What is your primary morning beverage?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'fd_04',
    category: 'Food & Lifestyle',
    question: "How spicy do you like your food?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'fd_05',
    category: 'Food & Lifestyle',
    question: "What do you do with pizza crusts?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'fd_06',
    category: 'Food & Lifestyle',
    question: "What is your stance on pineapple on pizza?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'fd_07',
    category: 'Food & Lifestyle',
    question: "How do you like your steak or meat cooked?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'fd_08',
    category: 'Food & Lifestyle',
    question: "How often do you cook a full homemade meal from scratch?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'fd_09',
    category: 'Food & Lifestyle',
    question: "What do you do if you find a bug in your house?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'fd_10',
    category: 'Food & Lifestyle',
    question: "How do you handle cereal and milk order of operations?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'fd_11',
    category: 'Food & Lifestyle',
    question: "What is your opinion on drinking milk straight from the carton?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'fd_12',
    category: 'Food & Lifestyle',
    question: "How often do you eat dessert or sweets after dinner?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'fd_13',
    category: 'Food & Lifestyle',
    question: "What is your policy on dipping fries in ice cream or milkshakes?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'fd_14',
    category: 'Food & Lifestyle',
    question: "How do you react when someone takes food from your plate without asking?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'fd_15',
    category: 'Food & Lifestyle',
    question: "How often do you drink carbonated soda or energy drinks?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'fd_16',
    category: 'Food & Lifestyle',
    question: "What is your primary snack while watching a movie?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'fd_17',
    category: 'Food & Lifestyle',
    question: "How often do you eat instant ramen noodles?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'fd_18',
    category: 'Food & Lifestyle',
    question: "What do you do with the remaining soup at the bottom of a cereal bowl?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'fd_19',
    category: 'Food & Lifestyle',
    question: "How do you eat a burger or sandwich?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'fd_20',
    category: 'Food & Lifestyle',
    question: "How often do you try new exotic foods you have never heard of?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'fd_21',
    category: 'Food & Lifestyle',
    question: "What is your stance on eating cold leftover pizza for breakfast?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'fd_22',
    category: 'Food & Lifestyle',
    question: "How do you handle condiments on fries?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'fd_23',
    category: 'Food & Lifestyle',
    question: "What is your go-to snack at 2 AM?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'fd_24',
    category: 'Food & Lifestyle',
    question: "How often do you eat at a fancy fine-dining restaurant?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'fd_25',
    category: 'Food & Lifestyle',
    question: "What do you do with apple skin or potato skins?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'fd_26',
    category: 'Food & Lifestyle',
    question: "How do you eat sushi?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'fd_27',
    category: 'Food & Lifestyle',
    question: "What is your opinion on dark chocolate vs milk chocolate?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'fd_28',
    category: 'Food & Lifestyle',
    question: "How often do you chew gum during the day?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'fd_29',
    category: 'Food & Lifestyle',
    question: "What do you do if your ice cream cone starts dripping on your hand?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'fd_30',
    category: 'Food & Lifestyle',
    question: "How do you like your popcorn at the movies?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'fd_31',
    category: 'Food & Lifestyle',
    question: "What is your primary choice of comfort food when stressed?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  },
  {
    id: 'fd_32',
    category: 'Food & Lifestyle',
    question: "How do you feel about sour candy?",
    options: [
      "A) Twice a day \u2014 Hyper clean",
      "B) Once a day like normal",
      "C) Every 2-3 days unless I sweat",
      "D) Once a week"
]
  },
  {
    id: 'fd_33',
    category: 'Food & Lifestyle',
    question: "What is your stance on eating seafood or fish?",
    options: [
      "A) 1 day max \u2014 Fresh daily",
      "B) 2 to 3 days",
      "C) A full week",
      "D) Until someone complains about the smell"
]
  },
  {
    id: 'fd_34',
    category: 'Food & Lifestyle',
    question: "How often do you drink iced drinks in freezing winter weather?",
    options: [
      "A) Before 7:00 AM \u2014 Early riser",
      "B) 8:00 AM to 10:00 AM",
      "C) 11:00 AM to 1:00 PM",
      "D) Past 2:00 PM \u2014 Night owl"
]
  },
  {
    id: 'fd_35',
    category: 'Food & Lifestyle',
    question: "What do you do if food falls out of your mouth while talking?",
    options: [
      "A) Instantly within seconds",
      "B) Within 10 to 30 minutes",
      "C) 2 to 5 hours later",
      "D) 3 days later with an apology"
]
  },
  {
    id: 'fd_36',
    category: 'Food & Lifestyle',
    question: "How do you handle hot soup that is burning your tongue?",
    options: [
      "A) Answer immediately with confidence",
      "B) Decline and google the phone number",
      "C) Let it ring and ignore completely",
      "D) Panic and put phone in airplane mode"
]
  },
  {
    id: 'fd_37',
    category: 'Food & Lifestyle',
    question: "What is your opinion on eating raw cookie dough?",
    options: [
      "A) Every single meal",
      "B) Regularly \u2014 A few times a week",
      "C) Strictly VEGAN / Vegetarian",
      "D) Synthetic protein paste only"
]
  },
  {
    id: 'fd_38',
    category: 'Food & Lifestyle',
    question: "How often do you eat breakfast within 30 minutes of waking up?",
    options: [
      "A) Black coffee / Espresso",
      "B) Sugary iced latte",
      "C) Energy drink in a can",
      "D) Green tea / Water only"
]
  },
  {
    id: 'fd_39',
    category: 'Food & Lifestyle',
    question: "What do you do with the last slice of pizza in a group setting?",
    options: [
      "A) Mild \u2014 Pepper is too spicy",
      "B) Medium heat",
      "C) Extra Hot \u2014 Ghost pepper level",
      "D) Extreme \u2014 Want to suffer"
]
  },
  {
    id: 'fd_40',
    category: 'Food & Lifestyle',
    question: "How often do you shop at the grocery store vs ordering online?",
    options: [
      "A) Eat them all",
      "B) Dip them in garlic sauce",
      "C) Leave them on the plate",
      "D) Feed them to pets"
]
  }
];

// Master Question Corpus (200 Total Prompts)
export const QUESTION_BANK = [
  ...PLAYER_NAME_PROMPTS,
  ...HYGIENE_SCHEDULE_PROMPTS,
  ...SOCIAL_BEHAVIOR_PROMPTS,
  ...FOOD_LIFESTYLE_PROMPTS
];

/**
 * Prepares a question for the active room session.
 * If the question is a player-name question, populates options with active player names A, B, C, D!
 */
export function prepareQuestion(question, players = []) {
  if (!question) return null;

  if (question.isPlayerNameQuestion && players.length >= 3) {
    const playerOptions = players.slice(0, 4).map((p, idx) => {
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
