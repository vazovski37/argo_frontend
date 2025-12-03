/**
 * Achievement definitions for the Poti AI Guide
 */

export interface Achievement {
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'exploration' | 'food' | 'culture' | 'social' | 'challenge' | 'story';
  isSecret: boolean;
}

export const achievements: Achievement[] = [
  // Exploration
  { slug: 'first_steps', name: 'First Steps', description: 'Visit your first location in Poti', icon: '👣', xpReward: 25, category: 'exploration', isSecret: false },
  { slug: 'getting_around', name: 'Getting Around', description: 'Visit 5 different locations', icon: '🗺️', xpReward: 75, category: 'exploration', isSecret: false },
  { slug: 'explorer', name: 'True Explorer', description: 'Visit 10 different locations', icon: '🧭', xpReward: 150, category: 'exploration', isSecret: false },
  { slug: 'golden_fleece_seeker', name: 'Golden Fleece Seeker', description: 'Visit all historical sites in Poti', icon: '🏆', xpReward: 300, category: 'exploration', isSecret: false },
  { slug: 'nature_lover', name: 'Nature Lover', description: 'Visit all nature spots including Kolkheti National Park', icon: '🌿', xpReward: 200, category: 'exploration', isSecret: false },

  // Food
  { slug: 'first_bite', name: 'First Bite', description: 'Visit your first restaurant', icon: '🍽️', xpReward: 25, category: 'food', isSecret: false },
  { slug: 'foodie', name: 'Foodie Explorer', description: 'Visit 3 different restaurants', icon: '👨‍🍳', xpReward: 100, category: 'food', isSecret: false },
  { slug: 'elarji_master', name: 'Elarji Master', description: 'Experience the iconic Samegrelo dish', icon: '🧀', xpReward: 75, category: 'food', isSecret: false },

  // Culture
  { slug: 'polyglot_beginner', name: 'Learning Georgian', description: 'Learn your first Georgian phrase', icon: '🗣️', xpReward: 25, category: 'culture', isSecret: false },
  { slug: 'polyglot', name: 'Polyglot', description: 'Learn 5 Georgian phrases', icon: '📚', xpReward: 100, category: 'culture', isSecret: false },
  { slug: 'polyglot_master', name: 'Language Master', description: 'Learn 10 Georgian phrases', icon: '🎓', xpReward: 200, category: 'culture', isSecret: false },

  // Social/Photo
  { slug: 'first_photo', name: 'Shutterbug', description: 'Take your first photo', icon: '📷', xpReward: 25, category: 'social', isSecret: false },
  { slug: 'photographer', name: 'Photographer', description: 'Take 10 photos', icon: '📸', xpReward: 100, category: 'social', isSecret: false },
  { slug: 'selfie_master', name: 'Selfie Master', description: 'Take 5 selfies at different locations', icon: '🤳', xpReward: 75, category: 'social', isSecret: false },

  // Challenge
  { slug: 'early_bird', name: 'Early Bird', description: 'Visit a location before 8 AM', icon: '🌅', xpReward: 50, category: 'challenge', isSecret: false },
  { slug: 'night_owl', name: 'Night Owl', description: 'Join the evening promenade after 8 PM', icon: '🦉', xpReward: 50, category: 'challenge', isSecret: false },
  { slug: 'sunset_chaser', name: 'Sunset Chaser', description: 'Watch sunset at the lighthouse viewpoint', icon: '🌇', xpReward: 75, category: 'challenge', isSecret: false },

  // Story
  { slug: 'argonaut_initiate', name: 'Argonaut Initiate', description: 'Complete the introduction to the Golden Fleece story', icon: '⚓', xpReward: 50, category: 'story', isSecret: false },
  { slug: 'argonaut_hero', name: 'Argonaut Hero', description: "Complete the full Argonaut's Journey quest", icon: '🏛️', xpReward: 300, category: 'story', isSecret: false },

  // Secret
  { slug: 'hidden_gem_finder', name: 'Hidden Gem Finder', description: 'Discover a hidden gem location', icon: '💎', xpReward: 100, category: 'exploration', isSecret: true },
  { slug: 'local_friend', name: 'Local Friend', description: 'Get a personal recommendation from the AI guide', icon: '🤝', xpReward: 50, category: 'social', isSecret: true },
  { slug: 'completionist', name: 'Completionist', description: 'Earn all non-secret achievements', icon: '👑', xpReward: 500, category: 'challenge', isSecret: true },
];

export const achievementPrompt = `
## Achievement System

You track and award achievements to users. Handle them with excitement!

### Earning Achievements
When a user earns an achievement:
1. Announce it with fanfare: "🎉 Achievement Unlocked!"
2. Show the icon and name
3. Explain what they did to earn it
4. Announce the XP reward
5. Check if this unlocks any new opportunities

### Achievement Categories
- **Exploration** 🗺️ - Visiting places
- **Food** 🍽️ - Culinary experiences  
- **Culture** 🎭 - Learning and traditions
- **Social** 📷 - Photos and interactions
- **Challenge** ⚡ - Special tasks
- **Story** 📖 - Quest completions

### Secret Achievements
Don't reveal secret achievements until earned. When discovered:
- Add extra excitement: "You've discovered a SECRET achievement!"
- These feel extra special

### Progress Updates
Occasionally mention progress toward achievements:
- "You're just 2 locations away from 'Getting Around'!"
- "One more photo and you'll be a true Photographer!"

### Available Achievements (Non-Secret)
${achievements.filter(a => !a.isSecret).map(a => `- ${a.icon} **${a.name}**: ${a.description} (${a.xpReward} XP)`).join('\n')}
`;

export default achievements;




