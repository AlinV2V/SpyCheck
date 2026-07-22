import json

pname_questions = [
    'From the operators at this console, who is the smartest of the group?',
    'Who in this room is the absolute worst driver?',
    'If our group gets pulled over by the police, who is the biggest snitch?',
    'Who in this group is most likely to fall for an obvious scam?',
    'If we were stranded on a deserted island, who would we eat first to survive?',
    'Who in this room has the most unhinged, chaotic sleep schedule?',
    'Who is the biggest drama queen when they get a mild cold?',
    'Who in this group would last the SHORTEST amount of time in prison?',
    'Who in this room takes the longest to text back?',
    'Who is most likely to accidentally set off a fire alarm while cooking?',
    'Who in this group spends the most money on impulse buys?',
    'Who is secretly the biggest lightweight when drinking?',
    'Who in this room would fail a basic 5th-grade math test right now?',
    'Who would be the absolute worst roommate to live with?',
    'Who in this group is most likely to marry a stranger on a dare?',
    'Who in this room has the highest daily screen time on their phone?',
    'Who is the first person to panic if the power goes out?',
    'Who is most likely to fake their own death to get out of a bad date?',
    'Who in this group is the worst secret keeper?',
    'Who would die first in a zombie apocalypse?',
    'Who in this room has the messiest bedroom right now?',
    'Who is most likely to try talking their way out of a ticket and fail?',
    'Who in this group is most likely to stalk an ex at 3 AM?',
    'Who in this room spends the most time arguing in internet comments?',
    'Who is secretly hiding a multi-millionaire fortune?',
    'Who in this group would be the first to sell out the team to alien invaders?',
    'Who is most likely to spend their life savings on a worthless NFT or meme stock?',
    'Who in this room gives the absolute worst advice?',
    'Who is most likely to laugh at the worst possible moment during a sad scene?',
    'Who in this room is most likely to get kicked out of an all-you-can-eat buffet?',
    'Who in this group is the biggest hypochondriac?',
    'Who is most likely to get lost even while using Google Maps?',
    'Who in this room is most likely to show up 2 hours late with an iced coffee?',
    'Who would make the absolute worst U.S. President?',
    'Who in this group spends the longest time sitting in the bathroom on their phone?',
    'Who is most likely to trip on a flat, even surface?',
    'Who in this room has the most embarrassing search history right now?',
    'Who is most likely to start a fight with an automated voice recording?',
    'Who in this group is most likely to accidentally reply-all to a massive work email?',
    'Who is most likely to bring a guitar to a party and start playing uninvited?',
    'Who in this room has the worst fashion sense when staying at home?',
    'Who is most likely to accidentally leak their own password on a stream?',
    'Who in this group is most likely to live in their parents basement until age 40?',
    'Who would be the absolute first to get eliminated on Reality TV?',
    'Who in this room is the most aggressive driver when stuck in traffic?',
    'Who is most likely to cry during an animated Disney movie?',
    'Who in this group has the highest body count of burnt meals?',
    'Who would be the worst person to trust with your unlocked phone for 10 minutes?',
    'Who in this room is most likely to join a cult by accident?',
    'Who is most likely to forget where they parked their car in a multi-story lot?',
    'Who in this group spends the most time staring at themselves in the mirror?',
    'Who is most likely to adopt 15 cats and become a hermit?',
    'Who in this room eats fast food for 80 percent of their daily meals?',
    'Who is most likely to lie about reading the Terms & Conditions?',
    'Who in this group would be the absolute worst undercover FBI agent?',
    'Who is most likely to drop their phone directly onto their own face while lying in bed?',
    'Who in this room is the biggest sore loser when losing a board game?',
    'Who is most likely to accidentally lock themselves out of their own apartment?',
    'Who in this group is most likely to leave someone on read for 3 weeks?',
    'Who would be the first person to call their mom if stuck in a light storm?',
    'Who in this room is most likely to order the exact same item at every restaurant forever?',
    'Who is most likely to get banned from a public discord server on day one?',
    'Who in this group has the worst sleepwalking or talking in sleep habits?',
    'Who would be the most suspicious-looking person at airport security?',
    'Who in this room spends the most money on mobile microtransactions?',
    'Who is most likely to get scammed by a fake hot singles in your area popup?',
    'Who in this group would be the absolute worst driver in a getaway car?',
    'Who is most likely to get locked inside a public restroom?',
    'Who in this room is most likely to accidentally spill a full glass of water on their keyboard?',
    'Who is most likely to forget their own anniversary or birthday?',
    'Who in this group is most likely to wear pajamas to a formal job interview?',
    'Who would last the longest in a box with 1,000 harmless spiders?',
    'Who in this room is most likely to eat food off the floor past the 5-second rule?',
    'Who is most likely to get caught talking to themselves in public?',
    'Who in this group has the most unhinged sleep posture?',
    'Who would be the first to break down if internet was turned off for a month?',
    'Who in this room is most likely to buy a useless gimmick item off a late-night TV ad?',
    'Who is most likely to give a fake name at Starbucks just for fun?',
    'Who in this group is the biggest loud snorer?',
    'Who is most likely to be secretly operating a meme page with 100k followers?'
]

hygiene_questions_list = [
    'Be honest: how often do you take a full shower?',
    'How many days in a row do you re-wear the exact same hoodie or pants?',
    'What time do you usually wake up on weekends?',
    'How often do you change or wash your bedsheets?',
    'How many snooze buttons do you press on your morning alarm?',
    'How often do you floss your teeth?',
    'How clean is the floor of your bedroom right now?',
    'How often do you wash your winter jacket or heavy coats?',
    'What do you do when you drop a piece of food on a clean kitchen floor?',
    'How often do you clean your computer keyboard or phone screen?',
    'How long can you go without checking your phone when awake?',
    'How often do you wash your bath towel?',
    'How often do you clean out your refrigerator of expired food?',
    'How often do you brush your hair or groom in the morning?',
    'What is your shower temperature setting?',
    'How many unread emails are sitting in your inbox right now?',
    'How often do you cut or trim your fingernails?',
    'How many browser tabs do you have open on your computer right now?',
    'What is your usual bedtime on a weekday night?',
    'How often do you eat meals while sitting in your bed?',
    'How many times a day do you check yourself out in the mirror?',
    'How often do you do your laundry?',
    'How long does a pair of socks last before you throw them away?',
    'How often do you take nap during the middle of the day?',
    'How clean is the inside of your car or backpack right now?',
    'How often do you buy new shoes?',
    'What is your phone battery percentage right now?',
    'How often do you drink a full glass of plain water?',
    'How often do you change your toothbrush?',
    'How long do you stay in the shower just staring at the wall?',
    'How often do you clean your earwax?',
    'How many pairs of shoes do you own in total?',
    'How often do you leave dirty dishes sitting in the sink overnight?',
    'How often do you vacuum or sweep your living space?',
    'How many cups of coffee or caffeine drinks do you have daily?',
    'How often do you check your social media notifications?',
    'How long do you spend picking out an outfit in the morning?',
    'How often do you forget where you put your keys or wallet?',
    'How often do you wash your hands after touching public door handles?',
    'How long do you sit on the toilet scrolling on your phone?'
]

social_questions_list = [
    'How fast do you respond to a text from a friend?',
    'What is your reaction when an unknown phone number calls you?',
    'How do you feel about attending large parties where you know nobody?',
    'How many unread notifications do you have on your phone right now?',
    'What do you do if a server brings you the wrong order at a restaurant?',
    'How often do you cancel plans last minute to stay home?',
    'How do you handle someone spoiling a movie or show for you?',
    'How much do you tip a food delivery driver?',
    'How do you react when someone takes a photo of you without warning?',
    'What is your go-to response in an awkward elevator silence?',
    'How often do you post stories on Instagram or social media?',
    'What do you do if a stranger starts talking to you in a line?',
    'How do you react when you see a former classmate in public?',
    'How long can you survive in a room with zero small talk?',
    'How often do you mute group chats on your phone?',
    'What is your policy on sharing food with friends?',
    'How do you react when someone leaves you on read for 24 hours?',
    'What do you do if someone sings Happy Birthday to you in public?',
    'How often do you make new friends online vs real life?',
    'What is your reaction when someone borrows your clothes?',
    'How do you feel about voice notes instead of text messages?',
    'What do you do if you forget someone name right after meeting them?',
    'How often do you stalk people on social media out of boredom?',
    'How do you react when someone cuts in front of you in line?',
    'How often do you use emojis when texting?',
    'What do you do if your friend has spinach stuck in their teeth?',
    'How do you handle getting lost in a city with friends?',
    'What do you do if someone gives you a terrible gift you hate?',
    'How often do you double-text if someone does not reply?',
    'How do you react when a pet comes up to you in public?',
    'What is your policy on holding the door for someone far away?',
    'How do you handle being placed in a group project with randoms?',
    'How often do you listen to music with headphones in public?',
    'What do you do if you notice your phone battery is at 1 percent?',
    'How do you react when someone spoils a game twist for you?',
    'What do you do if you drop a drink in front of a crowd?',
    'How often do you re-watch your favorite show instead of new ones?',
    'What is your policy on taking home leftovers from a restaurant?',
    'How do you handle someone waving at you who was actually waving to someone behind you?',
    'How often do you sing out loud in the shower or car?'
]

food_questions_list = [
    'How often do you order food delivery (UberEats or DoorDash) per week?',
    'How often do you eat fast food meat?',
    'What is your primary morning beverage?',
    'How spicy do you like your food?',
    'What do you do with pizza crusts?',
    'What is your stance on pineapple on pizza?',
    'How do you like your steak or meat cooked?',
    'How often do you cook a full homemade meal from scratch?',
    'What do you do if you find a bug in your house?',
    'How do you handle cereal and milk order of operations?',
    'What is your opinion on drinking milk straight from the carton?',
    'How often do you eat dessert or sweets after dinner?',
    'What is your policy on dipping fries in ice cream or milkshakes?',
    'How do you react when someone takes food from your plate without asking?',
    'How often do you drink carbonated soda or energy drinks?',
    'What is your primary snack while watching a movie?',
    'How often do you eat instant ramen noodles?',
    'What do you do with the remaining soup at the bottom of a cereal bowl?',
    'How do you eat a burger or sandwich?',
    'How often do you try new exotic foods you have never heard of?',
    'What is your stance on eating cold leftover pizza for breakfast?',
    'How do you handle condiments on fries?',
    'What is your go-to snack at 2 AM?',
    'How often do you eat at a fancy fine-dining restaurant?',
    'What do you do with apple skin or potato skins?',
    'How do you eat sushi?',
    'What is your opinion on dark chocolate vs milk chocolate?',
    'How often do you chew gum during the day?',
    'What do you do if your ice cream cone starts dripping on your hand?',
    'How do you like your popcorn at the movies?',
    'What is your primary choice of comfort food when stressed?',
    'How do you feel about sour candy?',
    'What is your stance on eating seafood or fish?',
    'How often do you drink iced drinks in freezing winter weather?',
    'What do you do if food falls out of your mouth while talking?',
    'How do you handle hot soup that is burning your tongue?',
    'What is your opinion on eating raw cookie dough?',
    'How often do you eat breakfast within 30 minutes of waking up?',
    'What do you do with the last slice of pizza in a group setting?',
    'How often do you shop at the grocery store vs ordering online?'
]

option_sets = [
    [
        'A) Twice a day — Hyper clean',
        'B) Once a day like normal',
        'C) Every 2-3 days unless I sweat',
        'D) Once a week'
    ],
    [
        'A) 1 day max — Fresh daily',
        'B) 2 to 3 days',
        'C) A full week',
        'D) Until someone complains about the smell'
    ],
    [
        'A) Before 7:00 AM — Early riser',
        'B) 8:00 AM to 10:00 AM',
        'C) 11:00 AM to 1:00 PM',
        'D) Past 2:00 PM — Night owl'
    ],
    [
        'A) Instantly within seconds',
        'B) Within 10 to 30 minutes',
        'C) 2 to 5 hours later',
        'D) 3 days later with an apology'
    ],
    [
        'A) Answer immediately with confidence',
        'B) Decline and google the phone number',
        'C) Let it ring and ignore completely',
        'D) Panic and put phone in airplane mode'
    ],
    [
        'A) Every single meal',
        'B) Regularly — A few times a week',
        'C) Strictly VEGAN / Vegetarian',
        'D) Synthetic protein paste only'
    ],
    [
        'A) Black coffee / Espresso',
        'B) Sugary iced latte',
        'C) Energy drink in a can',
        'D) Green tea / Water only'
    ],
    [
        'A) Mild — Pepper is too spicy',
        'B) Medium heat',
        'C) Extra Hot — Ghost pepper level',
        'D) Extreme — Want to suffer'
    ],
    [
        'A) Eat them all',
        'B) Dip them in garlic sauce',
        'C) Leave them on the plate',
        'D) Feed them to pets'
    ]
]

header_text = """/**
 * Intruder Check - Strict Deduction Question Bank (200+ Prompt Database)
 * 
 * GOLD RULES FOR SPY CHECK GAMEPLAY:
 * 1. ZERO KEYWORD LEAKS: Answer choices MUST NOT contain specific prompt keywords that leak topic to the Spy!
 * 2. PLAYER-NAME PROMPTS: Prompts where choices A, B, C, D are active player names.
 * 3. GENERIC PERSONALITY PROMPTS: Choices are generic frequencies, social reactions, or lifestyle habits.
 */

// Category 1: Player Name Prompts (80 Questions - Options are ALWAYS Player Names A, B, C, D)
export const PLAYER_NAME_PROMPTS = [
"""

body_pname = []
for idx, q in enumerate(pname_questions):
    body_pname.append(f"  {{\n    id: 'pname_{idx+1:02d}',\n    category: 'Group Consensus',\n    question: {json.dumps(q)},\n    isPlayerNameQuestion: true,\n    options: []\n  }}")

pname_str = ",\n".join(body_pname) + "\n];\n\n"

body_hgy = []
for idx, q in enumerate(hygiene_questions_list):
    opts = option_sets[idx % len(option_sets)]
    body_hgy.append(f"  {{\n    id: 'hgy_{idx+1:02d}',\n    category: 'Personal Habits',\n    question: {json.dumps(q)},\n    options: {json.dumps(opts, indent=6)}\n  }}")

hgy_str = "// Category 2: Hygiene & Daily Schedule (40 Questions)\nexport const HYGIENE_SCHEDULE_PROMPTS = [\n" + ",\n".join(body_hgy) + "\n];\n\n"

body_soc = []
for idx, q in enumerate(social_questions_list):
    opts = option_sets[(idx + 3) % len(option_sets)]
    body_soc.append(f"  {{\n    id: 'soc_{idx+1:02d}',\n    category: 'Social Preferences',\n    question: {json.dumps(q)},\n    options: {json.dumps(opts, indent=6)}\n  }}")

soc_str = "// Category 3: Social Behavior & Personal Life (40 Questions)\nexport const SOCIAL_BEHAVIOR_PROMPTS = [\n" + ",\n".join(body_soc) + "\n];\n\n"

body_food = []
for idx, q in enumerate(food_questions_list):
    opts = option_sets[(idx + 5) % len(option_sets)]
    body_food.append(f"  {{\n    id: 'fd_{idx+1:02d}',\n    category: 'Food & Lifestyle',\n    question: {json.dumps(q)},\n    options: {json.dumps(opts, indent=6)}\n  }}")

food_str = "// Category 4: Food & Lifestyle Scenarios (40 Questions)\nexport const FOOD_LIFESTYLE_PROMPTS = [\n" + ",\n".join(body_food) + "\n];\n\n"

footer_text = """// Master Question Corpus (200 Total Prompts)
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
"""

full_file = header_text + pname_str + hgy_str + soc_str + food_str + footer_text

with open(r'c:\Users\divaa\OneDrive\Desktop\SpyCheck\src\data\questionBank.js', 'w', encoding='utf-8') as f:
    f.write(full_file)

print('SUCCESSFULLY CREATED 200 PROMPT QUESTION BANK!')
