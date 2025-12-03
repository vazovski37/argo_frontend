/**
 * Prompt Builder for Poti AI Guide
 * 
 * This module combines all prompt components into a single system instruction.
 * You can customize which sections to include based on your needs.
 */

import { personality } from './personality';
import { history } from './history';
import { restaurants } from './restaurants';
import { attractions } from './attractions';
import { practical } from './practical';
import { buildGamificationPrompt, UserGameState } from './gamification';

export interface PromptConfig {
  includePersonality?: boolean;
  includeHistory?: boolean;
  includeRestaurants?: boolean;
  includeAttractions?: boolean;
  includePractical?: boolean;
  includeGamification?: boolean;
  customContext?: string;
  userPreferences?: UserPreferences;
  gameState?: UserGameState;
}

export interface UserPreferences {
  language?: 'en' | 'ka' | 'ru';
  interests?: ('history' | 'food' | 'nature' | 'culture' | 'nightlife')[];
  travelStyle?: 'budget' | 'mid-range' | 'luxury';
  duration?: string; // e.g., "2 days", "1 week"
}

/**
 * Build the complete system prompt for the Poti AI Guide
 */
export function buildPrompt(config: PromptConfig = {}): string {
  const {
    includePersonality = true,
    includeHistory = true,
    includeRestaurants = true,
    includeAttractions = true,
    includePractical = true,
    includeGamification = true,
    customContext,
    userPreferences,
    gameState,
  } = config;

  const sections: string[] = [];

  // Always start with personality/role definition
  if (includePersonality) {
    sections.push(personality);
  }

  // Add gamification system
  if (includeGamification) {
    sections.push(buildGamificationPrompt({ userState: gameState }));
  }

  // Add knowledge sections
  if (includeHistory) {
    sections.push(history);
  }

  if (includeRestaurants) {
    sections.push(restaurants);
  }

  if (includeAttractions) {
    sections.push(attractions);
  }

  if (includePractical) {
    sections.push(practical);
  }

  // Add user preferences context if provided
  if (userPreferences) {
    sections.push(buildUserContext(userPreferences));
  }

  // Add any custom context
  if (customContext) {
    sections.push(`\n## Additional Context\n${customContext}`);
  }

  // Add final instructions
  sections.push(buildFinalInstructions());

  return sections.join('\n\n---\n\n');
}

/**
 * Build context from user preferences
 */
function buildUserContext(prefs: UserPreferences): string {
  const lines: string[] = ['## Current User Context'];

  if (prefs.language) {
    const langMap = { en: 'English', ka: 'Georgian', ru: 'Russian' };
    lines.push(`- User prefers communication in ${langMap[prefs.language]}`);
  }

  if (prefs.interests?.length) {
    lines.push(`- User is particularly interested in: ${prefs.interests.join(', ')}`);
  }

  if (prefs.travelStyle) {
    lines.push(`- Travel style: ${prefs.travelStyle}`);
  }

  if (prefs.duration) {
    lines.push(`- Visit duration: ${prefs.duration}`);
  }

  return lines.join('\n');
}

/**
 * Final instructions for the AI
 */
function buildFinalInstructions(): string {
  return `
## Response Guidelines

### For Voice Conversations
- Keep responses concise (2-4 sentences typically)
- Speak naturally, as if having a real conversation
- Use pauses and emphasis for storytelling
- Ask clarifying questions when needed
- Don't list too many items at once - offer to tell more

### For Storytelling
- Set the scene vividly
- Use present tense for immersion ("Imagine you're standing...")
- Include sensory details (sights, sounds, smells)
- Connect history to present-day locations
- End stories with how visitors can experience it today

### When Giving Recommendations
- Be specific with names and locations
- Give honest opinions ("My personal favorite is...")
- Mention practical details (price range, opening hours if known)
- Offer alternatives for different preferences
- Always ask if they want more suggestions

### Handling Unknown Information
- Be honest: "I'm not certain about that specific detail..."
- Offer related information you do know
- Suggest how they could find out (ask locals, check at hotel, etc.)

### Remember
- You're a friendly local guide, not a search engine
- Prioritize memorable experiences over exhaustive lists
- Make visitors feel welcome and excited about Poti
- Every interaction should leave them wanting to explore more!
`;
}

// Export individual sections for granular control
export { personality } from './personality';
export { history } from './history';
export { restaurants } from './restaurants';
export { attractions } from './attractions';
export { practical } from './practical';

// Export gamification system
export { 
  buildGamificationPrompt,
  quests,
  achievements,
  ranks,
  getRankForXp,
  getXpToNextRank,
  type UserGameState,
  type Quest,
  type Achievement,
  type Rank,
} from './gamification';

// Default export: full prompt with all sections
export default buildPrompt();

