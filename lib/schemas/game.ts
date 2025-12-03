import { z } from "zod";

// Game state/progress schema
export const GameStateSchema = z.object({
  current_level: z.number(),
  current_rank: z.string(),
  total_xp: z.number(),
  xp_for_current_level: z.number().optional(),
  xp_for_next_level: z.number().optional(),
  xp_to_next_level: z.number().optional(),
  xp_progress_percent: z.number().optional(),
  locations_visited: z.number(),
  quests_completed: z.number(),
  photos_taken: z.number(),
  achievements_earned: z.number().optional(),
  phrases_learned: z.array(z.string()).default([]),
});

export type GameState = z.infer<typeof GameStateSchema>;

// Achievement schema
export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  xp_reward: z.number(),
  requirement_type: z.string(),
  requirement_value: z.number(),
  is_secret: z.boolean().default(false),
  category: z.string(),
  earned: z.boolean().default(false),
  earned_at: z.string().nullable().optional(),
});

export type Achievement = z.infer<typeof AchievementSchema>;

// Achievements response schema
export const AchievementsResponseSchema = z.object({
  achievements: z.array(AchievementSchema),
  total_earned: z.number().optional(),
  total_available: z.number().optional(),
});

export type AchievementsResponse = z.infer<typeof AchievementsResponseSchema>;

// Visit location request schema
export const VisitLocationRequestSchema = z.object({
  location_id: z.string().optional(),
  location_name: z.string().optional(),
}).refine((data) => data.location_id || data.location_name, {
  message: "Either location_id or location_name must be provided",
});

export type VisitLocationRequest = z.infer<typeof VisitLocationRequestSchema>;

// Visit location response schema
export const VisitLocationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  xp_earned: z.number(),
  level_up: z.boolean().optional(),
  new_level: z.number().optional(),
  new_rank: z.string().optional(),
  new_achievements: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
  })).default([]),
  location: z.any().optional(),
});

export type VisitLocationResponse = z.infer<typeof VisitLocationResponseSchema>;

// Visit record schema
export const VisitSchema = z.object({
  id: z.string(),
  location_id: z.string(),
  visited_at: z.string(),
  location: z.any().optional(),
});

export type Visit = z.infer<typeof VisitSchema>;

// Visited locations response schema
export const VisitedLocationsResponseSchema = z.object({
  visits: z.array(VisitSchema),
  total: z.number(),
});

export type VisitedLocationsResponse = z.infer<typeof VisitedLocationsResponseSchema>;

// Learn phrase request schema
export const LearnPhraseRequestSchema = z.object({
  phrase: z.string().min(1, "Phrase is required"),
  meaning: z.string().optional(),
});

export type LearnPhraseRequest = z.infer<typeof LearnPhraseRequestSchema>;

// Learn phrase response schema
export const LearnPhraseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  xp_earned: z.number(),
  new_achievements: z.array(z.any()).default([]),
});

export type LearnPhraseResponse = z.infer<typeof LearnPhraseResponseSchema>;

// Game stats schema
export const GameStatsSchema = z.object({
  level: z.number(),
  rank: z.string(),
  total_xp: z.number(),
  xp_to_next_level: z.number(),
  xp_progress_percent: z.number(),
  locations_visited: z.number(),
  achievements_earned: z.number(),
  quests_completed: z.number(),
  photos_taken: z.number(),
  phrases_learned: z.number(),
});

export type GameStats = z.infer<typeof GameStatsSchema>;

// Leaderboard entry schema
export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  user_id: z.string(),
  name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  level: z.number(),
  title: z.string(),
  total_xp: z.number(),
  locations_visited: z.number(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// Leaderboard response schema
export const LeaderboardResponseSchema = z.object({
  leaderboard: z.array(LeaderboardEntrySchema),
});

export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>;

