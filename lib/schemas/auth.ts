import { z } from "zod";

// User schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  is_admin: z.boolean().default(false),
  google_id: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// User progress schema
export const UserProgressSchema = z.object({
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
  achievements_earned: z.number(),
  phrases_learned: z.array(z.string()).default([]),
});

export type UserProgress = z.infer<typeof UserProgressSchema>;

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Register request schema
export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// Google auth request schema
export const GoogleAuthRequestSchema = z.object({
  credential: z.string().min(1, "Google credential is required"),
});

export type GoogleAuthRequest = z.infer<typeof GoogleAuthRequestSchema>;

// Auth response schema (login/register/google)
export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Current user response schema
export const CurrentUserResponseSchema = z.object({
  user: UserSchema,
  progress: UserProgressSchema.nullable(),
});

export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;

