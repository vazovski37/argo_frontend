import { z } from "zod";

// Quest step schema
export const QuestStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  location_id: z.string().optional(),
});

export type QuestStep = z.infer<typeof QuestStepSchema>;

// Quest schema
export const QuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  story_intro: z.string().nullable().optional(),
  xp_reward: z.number(),
  difficulty: z.string().optional(),
  estimated_time: z.number().nullable().optional(),
  is_daily: z.boolean().default(false),
  steps: z.array(QuestStepSchema),
  step_count: z.number().optional(),
});

export type Quest = z.infer<typeof QuestSchema>;

// Quests response schema
export const QuestsResponseSchema = z.object({
  quests: z.array(QuestSchema),
  total: z.number().optional(),
});

export type QuestsResponse = z.infer<typeof QuestsResponseSchema>;

// User quest schema
export const UserQuestSchema = z.object({
  id: z.string(),
  quest_id: z.string(),
  status: z.enum(["active", "completed", "abandoned"]),
  current_step: z.number(),
  started_at: z.string(),
  completed_at: z.string().nullable().optional(),
  quest: QuestSchema.optional(),
});

export type UserQuest = z.infer<typeof UserQuestSchema>;

// User quests response schema
export const UserQuestsResponseSchema = z.object({
  active: z.array(UserQuestSchema),
  completed: z.array(UserQuestSchema),
  total_active: z.number().optional(),
  total_completed: z.number().optional(),
});

export type UserQuestsResponse = z.infer<typeof UserQuestsResponseSchema>;

// Start quest response schema
export const StartQuestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user_quest: UserQuestSchema.optional(),
  story_intro: z.string().nullable().optional(),
});

export type StartQuestResponse = z.infer<typeof StartQuestResponseSchema>;

// Advance quest response schema
export const AdvanceQuestResponseSchema = z.object({
  success: z.boolean(),
  current_step: z.number().optional(),
  completed: z.boolean(),
  message: z.string(),
  xp_earned: z.number().optional(),
  level_up: z.boolean().optional(),
  new_level: z.number().optional(),
  next_step: QuestStepSchema.optional(),
});

export type AdvanceQuestResponse = z.infer<typeof AdvanceQuestResponseSchema>;

// Abandon quest response schema
export const AbandonQuestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type AbandonQuestResponse = z.infer<typeof AbandonQuestResponseSchema>;

