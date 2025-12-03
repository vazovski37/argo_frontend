/**
 * Gamification System for Poti AI Guide
 * 
 * This module combines quests, achievements, and ranks into a cohesive game system.
 */

import { quests, questPrompt, Quest, QuestStep } from './quests';
import { achievements, achievementPrompt, Achievement } from './achievements';
import { ranks, rankPrompt, getRankForXp, getXpToNextRank, Rank } from './ranks';

export interface UserGameState {
  totalXp: number;
  currentLevel: number;
  currentRank: string;
  locationsVisited: number;
  photosTaken: number;
  questsCompleted: number;
  achievementsEarned: number;
  phrasesLearned: string[];
  activeQuests: string[];
  completedAchievements: string[];
}

export interface GameContext {
  userState?: UserGameState;
  includeQuests?: boolean;
  includeAchievements?: boolean;
  includeRanks?: boolean;
}

/**
 * Build the gamification prompt based on user state and options
 */
export function buildGamificationPrompt(context: GameContext = {}): string {
  const {
    userState,
    includeQuests = true,
    includeAchievements = true,
    includeRanks = true,
  } = context;

  const sections: string[] = [];

  // Core gamification intro
  sections.push(`
## 🎮 Gamification System

You are running an interactive, gamified travel experience! Make exploration fun and rewarding.

### Core Principles
- Every interaction is an opportunity for adventure
- Celebrate achievements with enthusiasm
- Create narrative tension and excitement
- Make users feel like heroes on a journey
- Use XP and levels to motivate exploration
`);

  // Add user context if available
  if (userState) {
    const rank = getRankForXp(userState.totalXp);
    const xpToNext = getXpToNextRank(userState.totalXp);
    
    sections.push(`
### Current User Status
- **Rank**: ${rank.icon} ${rank.name} (Level ${rank.level})
- **Total XP**: ${userState.totalXp}${xpToNext ? ` (${xpToNext} XP to next level)` : ' (MAX LEVEL!)'}
- **Locations Visited**: ${userState.locationsVisited}
- **Photos Taken**: ${userState.photosTaken}
- **Quests Completed**: ${userState.questsCompleted}
- **Achievements Earned**: ${userState.achievementsEarned}
- **Georgian Phrases Learned**: ${userState.phrasesLearned.length}
${userState.activeQuests.length > 0 ? `- **Active Quests**: ${userState.activeQuests.join(', ')}` : '- No active quests'}

Use this context to personalize interactions. Reference their progress, suggest next steps based on their level, and celebrate their journey!
`);
  }

  // Add system sections
  if (includeRanks) {
    sections.push(rankPrompt);
  }

  if (includeQuests) {
    sections.push(questPrompt);
  }

  if (includeAchievements) {
    sections.push(achievementPrompt);
  }

  // Photo system
  sections.push(`
## 📸 Photo System

Encourage users to take photos throughout their journey!

### Photo Types
- **Selfies** 🤳 - User with landmarks (10 XP each)
- **Place Photos** 🏛️ - Scenic shots of locations (10 XP each)
- **Food Photos** 🍽️ - Culinary discoveries (10 XP each)
- **Achievement Photos** 🏆 - Celebrating milestones (15 XP each)

### When to Suggest Photos
- At scenic viewpoints: "This would make an amazing photo!"
- At restaurants: "Quick, capture that elarji before it disappears!"
- After achievements: "Let's commemorate this moment with a photo!"
- At quest completions: "Take a victory selfie, Argonaut!"

### Photo Prompts
Be creative with photo suggestions:
- "Strike a heroic pose - you've earned it!"
- "Get the lighthouse in the background!"
- "Show me that delicious Samegrelo feast!"
`);

  // Interaction guidelines
  sections.push(`
## 🎯 Gamified Interaction Guidelines

### Starting Conversations
- Greet with their rank: "${ranks[2].greeting}" (for Explorer rank)
- Mention active quests or nearby opportunities
- Show excitement about their journey

### During Exploration
- Announce when they're near quest locations
- Hint at nearby achievements
- Suggest photo opportunities
- Share XP earnings for activities

### Rewards & Celebrations
- Be enthusiastic about achievements
- Create dramatic moments for level-ups
- Use emojis to highlight rewards
- Make users feel accomplished

### Keeping Engagement High
- Suggest next objectives
- Create friendly competition with progress
- Tell stories that connect to quests
- Always have a "next adventure" ready
`);

  return sections.join('\n\n---\n\n');
}

// Export everything
export { quests, Quest, QuestStep } from './quests';
export { achievements, Achievement } from './achievements';
export { ranks, Rank, getRankForXp, getXpToNextRank } from './ranks';

// Default export
export default buildGamificationPrompt;





