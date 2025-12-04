/**
 * Quest definitions and narratives for the Poti AI Guide
 */

export interface QuestStep {
  step: number;
  title: string;
  description: string;
  locationSlug?: string;
  story: string;
}

export interface Quest {
  slug: string;
  name: string;
  description: string;
  storyIntro: string;
  type: 'main' | 'side' | 'daily' | 'challenge';
  xpReward: number;
  steps: QuestStep[];
}

export const quests: Quest[] = [
  {
    slug: 'argonauts_journey',
    name: "The Argonaut's Journey",
    description: 'Follow in the footsteps of Jason and the Argonauts through ancient Colchis.',
    storyIntro: `Thousands of years ago, Greek heroes sailed across the Black Sea to these very shores, seeking the legendary Golden Fleece. Now, brave traveler, you shall walk the same paths they once tread. Are you ready to begin your journey?`,
    type: 'main',
    xpReward: 500,
    steps: [
      {
        step: 1,
        title: 'The Landing',
        description: "Visit the Argonauts Monument where Jason's crew first landed",
        locationSlug: 'argonauts_monument',
        story: 'You stand where legends began. Jason and his crew of heroes stepped onto this shore, their hearts full of hope and determination.',
      },
      {
        step: 2,
        title: 'The Ancient Port',
        description: 'Explore the Port area where ancient ships once docked',
        locationSlug: 'poti_port',
        story: 'The harbor bustles now as it did then. Imagine wooden ships with painted eyes on their prows, bringing traders and adventurers from across the known world.',
      },
      {
        step: 3,
        title: 'The River Phasis',
        description: 'Walk along the Rioni River, the ancient Phasis',
        locationSlug: 'rioni_river',
        story: "This is the very river the Argonauts sailed up to reach King Aeëtes. The same waters that witnessed Medea's fateful decision to help Jason.",
      },
      {
        step: 4,
        title: 'The Beacon',
        description: 'Visit the Poti Lighthouse',
        locationSlug: 'poti_lighthouse',
        story: "Though this lighthouse is younger, it stands as a symbol of guidance - just as the stars guided Jason's ship, the Argo, to these shores.",
      },
      {
        step: 5,
        title: 'The Legacy',
        description: 'Visit the Ancient Phasis archaeological site',
        locationSlug: 'ancient_phasis',
        story: 'You have completed the journey. The Golden Fleece may be legend, but the adventure - that was real. And now, you are part of this story too.',
      },
    ],
  },
  {
    slug: 'taste_of_colchis',
    name: 'Taste of Colchis',
    description: 'Experience the legendary flavors of Samegrelo cuisine.',
    storyIntro: `The people of Colchis were known not just for the Golden Fleece, but for their rich culinary traditions. Samegrelo cuisine is among Georgia's finest - spicy, flavorful, and made with love. Ready to taste history?`,
    type: 'side',
    xpReward: 150,
    steps: [
      {
        step: 1,
        title: 'The Signature Dish',
        description: 'Try Elarji at Restaurant Kolkheti',
        locationSlug: 'restaurant_kolkheti',
        story: 'Elarji - cornmeal with stretchy sulguni cheese. Watch how it stretches like magic! This dish has been made the same way for generations.',
      },
      {
        step: 2,
        title: 'Local Flavors',
        description: 'Visit Cafe Phazisi for authentic Samegrelo cuisine',
        locationSlug: 'cafe_phazisi',
        story: 'This is where locals come for the real taste of home. The recipes here have been passed down through families.',
      },
      {
        step: 3,
        title: 'Fresh Catch',
        description: 'Visit the Local Fish Market',
        locationSlug: 'fish_market',
        story: 'Every morning, the freshest Black Sea fish arrives here. This is the secret to great Georgian fish dishes!',
      },
    ],
  },
  {
    slug: 'lighthouse_keeper',
    name: "The Lighthouse Keeper's Secret",
    description: 'Discover the magic of Poti Lighthouse at different times of day.',
    storyIntro: `The old lighthouse keeper used to say the lighthouse has three faces - one at dawn, one at day, and one at dusk. Each reveals a different secret. Will you discover them all?`,
    type: 'side',
    xpReward: 200,
    steps: [
      {
        step: 1,
        title: 'Morning Light',
        description: 'Visit the lighthouse in the morning',
        locationSlug: 'poti_lighthouse',
        story: 'In the soft morning light, the lighthouse stands proud against the awakening sky. The keeper always said mornings were for contemplation.',
      },
      {
        step: 2,
        title: 'Golden Hour',
        description: 'Watch sunset at the Lighthouse Sunset Point',
        locationSlug: 'lighthouse_sunset',
        story: "As the sun dips below the Black Sea, the lighthouse glows golden. This is the keeper's favorite hour - when the old and new light meet.",
      },
      {
        step: 3,
        title: 'Night Watch',
        description: 'See the lighthouse beam at night',
        locationSlug: 'poti_lighthouse',
        story: 'The beam cuts through the darkness, just as it has for over 150 years, guiding ships safely home. You now share this secret with the keepers of old.',
      },
    ],
  },
  {
    slug: 'nature_expedition',
    name: 'Kolkheti Expedition',
    description: 'Explore the ancient wetlands that existed since the time of dinosaurs.',
    storyIntro: `Before there were Argonauts, before there were humans, these forests stood. The Kolkheti wetlands are a window into the prehistoric past. Let's step back in time.`,
    type: 'side',
    xpReward: 250,
    steps: [
      {
        step: 1,
        title: 'The Lake',
        description: 'Visit Paliastomi Lake',
        locationSlug: 'paliastomi_lake',
        story: 'Thousands of birds call this lake home. In autumn, the sky fills with migrants from across the world. Nature puts on the greatest show.',
      },
      {
        step: 2,
        title: 'Ancient Forest',
        description: 'Explore Kolkheti National Park',
        locationSlug: 'kolkheti_park',
        story: 'Walk among trees whose ancestors shaded dinosaurs. These forests have remained unchanged for millions of years. You are walking through living history.',
      },
      {
        step: 3,
        title: "River's End",
        description: 'Visit where the Rioni meets the Black Sea',
        locationSlug: 'rioni_river',
        story: 'Where freshwater meets salt, where river becomes sea. The ancient Greeks believed this was the edge of the known world. You have reached it.',
      },
    ],
  },
];

export const questPrompt = `
## Quest System

You manage an interactive quest system for visitors. Here's how to handle quests:

### Active Quests
When a user has an active quest, remind them of their progress naturally in conversation:
- "By the way, you're on step 3 of The Argonaut's Journey - the River Phasis awaits!"
- "Don't forget, you still need to visit the lighthouse to complete the Lighthouse Keeper's quest!"

### Starting Quests
When suggesting a quest, be dramatic and inviting:
- Build anticipation with the story intro
- Explain what they'll experience
- Ask if they're ready to begin

### Completing Steps
When a user completes a quest step:
1. Celebrate their achievement
2. Tell the story for that step dramatically
3. Reveal what comes next
4. Award XP and announce it

### Quest Completion
When a user completes an entire quest:
1. Give a dramatic conclusion
2. Celebrate with enthusiasm
3. Award the full XP reward
4. Suggest related quests or achievements

### Available Quests
${quests.map(q => `- **${q.name}** (${q.type}): ${q.description} - ${q.xpReward} XP`).join('\n')}
`;

export default quests;






