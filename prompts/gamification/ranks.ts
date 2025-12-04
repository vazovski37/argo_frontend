/**
 * Rank/Level system for the Poti AI Guide
 */

export interface Rank {
  level: number;
  name: string;
  nameKa: string; // Georgian name
  minXp: number;
  maxXp: number;
  icon: string;
  perks: string[];
  greeting: string;
}

export const ranks: Rank[] = [
  {
    level: 1,
    name: 'Tourist',
    nameKa: 'ტურისტი',
    minXp: 0,
    maxXp: 99,
    icon: '🎒',
    perks: ['Basic guide features', 'Access to main quest'],
    greeting: "Welcome to Poti, Tourist! Your adventure begins here.",
  },
  {
    level: 2,
    name: 'Traveler',
    nameKa: 'მოგზაური',
    minXp: 100,
    maxXp: 299,
    icon: '🧳',
    perks: ['Unlock side quests', 'Daily challenges available'],
    greeting: "Ah, Traveler! You're starting to know our city. Keep exploring!",
  },
  {
    level: 3,
    name: 'Explorer',
    nameKa: 'მკვლევარი',
    minXp: 300,
    maxXp: 599,
    icon: '🧭',
    perks: ['Hidden gem hints', 'Personalized recommendations'],
    greeting: "Explorer! You've earned your compass. The secrets of Poti await you.",
  },
  {
    level: 4,
    name: 'Adventurer',
    nameKa: 'თავგადასავლების მოყვარული',
    minXp: 600,
    maxXp: 999,
    icon: '⚔️',
    perks: ['Special challenge quests', 'Local insider tips'],
    greeting: "Brave Adventurer! You walk these streets like you belong here.",
  },
  {
    level: 5,
    name: 'Local Legend',
    nameKa: 'ადგილობრივი ლეგენდა',
    minXp: 1000,
    maxXp: 1999,
    icon: '🌟',
    perks: ['All features unlocked', 'Story mode narrator access'],
    greeting: "Local Legend! The people of Poti speak of your adventures in hushed tones.",
  },
  {
    level: 6,
    name: 'Honorary Potian',
    nameKa: 'საპატიო პოტელი',
    minXp: 2000,
    maxXp: Infinity,
    icon: '👑',
    perks: ['Maximum prestige', 'You ARE the guide now'],
    greeting: "Honorary Potian! გილოცავ! You have become one of us. Poti is your home.",
  },
];

export function getRankForXp(xp: number): Rank {
  return ranks.find(r => xp >= r.minXp && xp <= r.maxXp) || ranks[0];
}

export function getXpToNextRank(currentXp: number): number | null {
  const currentRank = getRankForXp(currentXp);
  const nextRank = ranks.find(r => r.level === currentRank.level + 1);
  if (!nextRank) return null;
  return nextRank.minXp - currentXp;
}

export const rankPrompt = `
## Rank & Level System

Users progress through ranks by earning XP. Treat ranks with respect and ceremony!

### Ranks (Levels 1-6)
${ranks.map(r => `
**Level ${r.level}: ${r.icon} ${r.name}** (${r.nameKa})
- XP Required: ${r.minXp}${r.maxXp === Infinity ? '+' : `-${r.maxXp}`}
- Perks: ${r.perks.join(', ')}
- Greeting: "${r.greeting}"
`).join('')}

### Rank Progression
- Mention XP gains after activities
- Celebrate level-ups with fanfare
- Use the rank greeting when appropriate
- Reference perks that unlock at new levels

### Level Up Ceremony
When a user reaches a new rank:
1. Dramatic pause: "Wait... something's happening..."
2. Announce: "🎊 LEVEL UP! You are now a [Rank Name]!"
3. Say the rank greeting
4. Explain new perks
5. Encourage continued exploration

### Progress Updates
Share progress naturally:
- "You're only 50 XP away from becoming an Explorer!"
- "As an Adventurer, you've earned access to special challenges."
`;

export default ranks;






