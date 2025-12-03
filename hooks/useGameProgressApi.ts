/**
 * Game Progress Hook - Uses Flask Backend API
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/utils/api/client";

export interface GameState {
  totalXp: number;
  currentLevel: number;
  currentRank: string;
  locationsVisited: number;
  photosTaken: number;
  questsCompleted: number;
  achievementsEarned: number;
  phrasesLearned: string[];
  xpToNextLevel: number;
  xpProgressPercent: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  requirementType: string;
  requirementValue: number;
  isSecret: boolean;
  category: string;
  earned: boolean;
  earnedAt?: string;
}

export interface Location {
  id: string;
  name: string;
  nameKa?: string;
  description: string;
  category: string;
  latitude?: number;
  longitude?: number;
  xpReward: number;
  imageUrl?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  storyIntro?: string;
  xpReward: number;
  steps: Array<{ title: string; description: string; locationId?: string }>;
  isDaily: boolean;
  difficulty: string;
  estimatedTime?: number;
  stepCount: number;
}

export interface UserQuest {
  id: string;
  questId: string;
  status: "active" | "completed" | "abandoned";
  currentStep: number;
  startedAt: string;
  completedAt?: string;
  quest: Quest;
}

interface VisitResult {
  success: boolean;
  message: string;
  xpEarned: number;
  newAchievements: string[];
  levelUp?: boolean;
  newLevel?: number;
  newRank?: string;
}

export function useGameProgressApi() {
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [visitedLocationIds, setVisitedLocationIds] = useState<string[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [progressRes, achievementsRes, locationsRes, visitedRes, questsRes, userQuestsRes] =
        await Promise.all([
          api.getProgress(),
          api.getAchievements(),
          api.getLocations(),
          api.getVisitedLocations(),
          api.getQuests(),
          api.getMyQuests(),
        ]);

      if (progressRes.data) {
        setGameState({
          totalXp: progressRes.data.total_xp,
          currentLevel: progressRes.data.current_level,
          currentRank: progressRes.data.current_rank,
          locationsVisited: progressRes.data.locations_visited,
          photosTaken: progressRes.data.photos_taken,
          questsCompleted: progressRes.data.quests_completed,
          achievementsEarned: progressRes.data.achievements_earned,
          phrasesLearned: progressRes.data.phrases_learned || [],
          xpToNextLevel: progressRes.data.xp_to_next_level,
          xpProgressPercent: progressRes.data.xp_progress_percent,
        });
      }

      if (achievementsRes.data?.achievements) {
        setAchievements(
          achievementsRes.data.achievements.map((a: any) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            icon: a.icon,
            xpReward: a.xp_reward,
            requirementType: a.requirement_type,
            requirementValue: a.requirement_value,
            isSecret: a.is_secret,
            category: a.category,
            earned: a.earned,
            earnedAt: a.earned_at,
          }))
        );
      }

      if (locationsRes.data?.locations) {
        setLocations(
          locationsRes.data.locations.map((l: any) => ({
            id: l.id,
            name: l.name,
            nameKa: l.name_ka,
            description: l.description,
            category: l.category,
            latitude: l.latitude,
            longitude: l.longitude,
            xpReward: l.xp_reward,
            imageUrl: l.image_url,
          }))
        );
      }

      if (visitedRes.data?.visits) {
        setVisitedLocationIds(visitedRes.data.visits.map((v: any) => v.location_id));
      }

      if (questsRes.data?.quests) {
        setQuests(
          questsRes.data.quests.map((q: any) => ({
            id: q.id,
            name: q.name,
            description: q.description,
            storyIntro: q.story_intro,
            xpReward: q.xp_reward,
            steps: q.steps,
            isDaily: q.is_daily,
            difficulty: q.difficulty,
            estimatedTime: q.estimated_time,
            stepCount: q.step_count,
          }))
        );
      }

      if (userQuestsRes.data) {
        const active = userQuestsRes.data.active || [];
        const completed = userQuestsRes.data.completed || [];
        setUserQuests([...active, ...completed].map((uq: any) => ({
          id: uq.id,
          questId: uq.quest_id,
          status: uq.status,
          currentStep: uq.current_step,
          startedAt: uq.started_at,
          completedAt: uq.completed_at,
          quest: uq.quest,
        })));
      }
    } catch (err) {
      console.error("Error loading game data:", err);
      setError("Failed to load game data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only load if user is authenticated
    if (api.getToken()) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [loadData]);

  // Visit a location
  const visitLocation = useCallback(async (locationId: string): Promise<VisitResult> => {
    const result = await api.visitLocation(locationId);

    if (result.error) {
      return {
        success: false,
        message: result.error,
        xpEarned: 0,
        newAchievements: [],
      };
    }

    // Refresh data after visit
    await loadData();

    return {
      success: result.data?.success || false,
      message: result.data?.message || "",
      xpEarned: result.data?.xp_earned || 0,
      newAchievements: result.data?.new_achievements || [],
      levelUp: result.data?.level_up,
      newLevel: result.data?.new_level,
      newRank: result.data?.new_rank,
    };
  }, [loadData]);

  // Visit location by name (for AI function calling)
  const visitLocationByName = useCallback(async (locationName: string): Promise<VisitResult> => {
    const result = await api.visitLocation(undefined, locationName);

    if (result.error) {
      return {
        success: false,
        message: result.error,
        xpEarned: 0,
        newAchievements: [],
      };
    }

    await loadData();

    return {
      success: result.data?.success || false,
      message: result.data?.message || "",
      xpEarned: result.data?.xp_earned || 0,
      newAchievements: result.data?.new_achievements || [],
      levelUp: result.data?.level_up,
      newLevel: result.data?.new_level,
      newRank: result.data?.new_rank,
    };
  }, [loadData]);

  // Learn a phrase
  const learnPhrase = useCallback(async (phrase: string, meaning?: string) => {
    const result = await api.learnPhrase(phrase, meaning);

    if (result.data?.success) {
      await loadData();
    }

    return result.data || { success: false, xp_earned: 0 };
  }, [loadData]);

  // Start a quest
  const startQuest = useCallback(async (questId: string) => {
    const result = await api.startQuest(questId);

    if (result.data?.success) {
      await loadData();
    }

    return result.data;
  }, [loadData]);

  // Advance a quest
  const advanceQuest = useCallback(async (questId: string) => {
    const result = await api.advanceQuest(questId);

    if (result.data?.success) {
      await loadData();
    }

    return result.data;
  }, [loadData]);

  // Upload photo
  const uploadPhoto = useCallback(async (
    file: File,
    locationId?: string,
    caption?: string,
    isSelfie = false
  ) => {
    const result = await api.uploadPhoto(file, locationId, caption, isSelfie);

    if (result.data) {
      await loadData();
    }

    return result.data;
  }, [loadData]);

  // Refresh all data
  const refreshProgress = useCallback(() => {
    return loadData();
  }, [loadData]);

  return {
    loading,
    error,
    gameState,
    achievements,
    userAchievements: achievements.filter((a) => a.earned),
    locations,
    visitedLocationIds,
    quests,
    userQuests,
    visitLocation,
    visitLocationByName,
    learnPhrase,
    startQuest,
    advanceQuest,
    uploadPhoto,
    refreshProgress,
  };
}

export default useGameProgressApi;


