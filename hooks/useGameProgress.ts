"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserGameState, getRankForXp } from "@/prompts";

export interface Location {
  id: string;
  name: string;
  nameKa: string | null;
  description: string | null;
  category: string;
  xpReward: number;
  imageUrl: string | null;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: string;
  isSecret: boolean;
}

export interface Quest {
  id: string;
  slug: string;
  name: string;
  description: string;
  storyIntro: string | null;
  questType: string;
  xpReward: number;
  steps: any[];
  isActive: boolean;
}

export interface UserQuest {
  id: string;
  questId: string;
  status: string;
  currentStep: number;
  stepsCompleted: number[];
  startedAt: string;
  completedAt: string | null;
  quest: Quest;
}

export interface UserPhoto {
  id: string;
  locationId: string | null;
  photoUrl: string;
  photoType: string;
  caption: string | null;
  isPublic: boolean;
  xpEarned: number;
  createdAt: string;
}

export interface UseGameProgressReturn {
  // State
  isLoading: boolean;
  error: string | null;
  gameState: UserGameState | null;
  locations: Location[];
  achievements: Achievement[];
  userAchievements: string[];
  quests: Quest[];
  userQuests: UserQuest[];
  userPhotos: UserPhoto[];
  visitedLocationIds: string[];

  // Actions
  refreshProgress: () => Promise<void>;
  visitLocation: (locationId: string) => Promise<{ xpEarned: number; newAchievements: string[] }>;
  startQuest: (questId: string) => Promise<void>;
  completeQuestStep: (questId: string, stepIndex: number) => Promise<{ xpEarned: number; questCompleted: boolean }>;
  uploadPhoto: (file: File, type: string, locationId?: string, caption?: string) => Promise<UserPhoto>;
  learnPhrase: (phrase: string) => Promise<void>;
  checkAchievements: () => Promise<string[]>;
}

export function useGameProgress(): UseGameProgressReturn {
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<UserGameState | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [visitedLocationIds, setVisitedLocationIds] = useState<string[]>([]);

  // Fetch all data
  const refreshProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not logged in");
        setIsLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [
        progressRes,
        locationsRes,
        achievementsRes,
        userAchievementsRes,
        questsRes,
        userQuestsRes,
        userPhotosRes,
        visitsRes,
      ] = await Promise.all([
        supabase.from("user_progress").select("*").eq("user_id", user.id).single(),
        supabase.from("locations").select("*"),
        supabase.from("achievements").select("*"),
        supabase.from("user_achievements").select("achievement_id").eq("user_id", user.id),
        supabase.from("quests").select("*").eq("is_active", true),
        supabase.from("user_quests").select("*, quest:quests(*)").eq("user_id", user.id),
        supabase.from("user_photos").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("user_location_visits").select("location_id").eq("user_id", user.id),
      ]);

      // Handle progress (might not exist yet)
      let progress = progressRes.data;
      if (!progress) {
        // Create initial progress
        const { data: newProgress } = await supabase
          .from("user_progress")
          .insert({ user_id: user.id })
          .select()
          .single();
        progress = newProgress;
      }

      if (progress) {
        const rank = getRankForXp(progress.total_xp);
        setGameState({
          totalXp: progress.total_xp,
          currentLevel: progress.current_level,
          currentRank: rank.name,
          locationsVisited: progress.locations_visited,
          photosTaken: progress.photos_taken,
          questsCompleted: progress.quests_completed,
          achievementsEarned: progress.achievements_earned,
          phrasesLearned: progress.phrases_learned || [],
          activeQuests: userQuestsRes.data?.filter((q: any) => q.status === 'active').map((q: any) => q.quest?.name) || [],
          completedAchievements: userAchievementsRes.data?.map((a: any) => a.achievement_id) || [],
        });
      }

      // Set other data
      if (locationsRes.data) {
        setLocations(locationsRes.data.map((l: any) => ({
          id: l.id,
          name: l.name,
          nameKa: l.name_ka,
          description: l.description,
          category: l.category,
          xpReward: l.xp_reward,
          imageUrl: l.image_url,
        })));
      }

      if (achievementsRes.data) {
        setAchievements(achievementsRes.data.map((a: any) => ({
          id: a.id,
          slug: a.slug,
          name: a.name,
          description: a.description,
          icon: a.icon,
          xpReward: a.xp_reward,
          category: a.category,
          isSecret: a.is_secret,
        })));
      }

      if (userAchievementsRes.data) {
        setUserAchievements(userAchievementsRes.data.map((a: any) => a.achievement_id));
      }

      if (questsRes.data) {
        setQuests(questsRes.data.map((q: any) => ({
          id: q.id,
          slug: q.slug,
          name: q.name,
          description: q.description,
          storyIntro: q.story_intro,
          questType: q.quest_type,
          xpReward: q.xp_reward,
          steps: q.steps,
          isActive: q.is_active,
        })));
      }

      if (userQuestsRes.data) {
        setUserQuests(userQuestsRes.data.map((uq: any) => ({
          id: uq.id,
          questId: uq.quest_id,
          status: uq.status,
          currentStep: uq.current_step,
          stepsCompleted: uq.steps_completed || [],
          startedAt: uq.started_at,
          completedAt: uq.completed_at,
          quest: uq.quest,
        })));
      }

      if (userPhotosRes.data) {
        setUserPhotos(userPhotosRes.data.map((p: any) => ({
          id: p.id,
          locationId: p.location_id,
          photoUrl: p.photo_url,
          photoType: p.photo_type,
          caption: p.caption,
          isPublic: p.is_public,
          xpEarned: p.xp_earned,
          createdAt: p.created_at,
        })));
      }

      if (visitsRes.data) {
        setVisitedLocationIds(visitsRes.data.map((v: any) => v.location_id));
      }

    } catch (err) {
      console.error("Error fetching game progress:", err);
      setError("Failed to load game progress");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Visit a location
  const visitLocation = useCallback(async (locationId: string): Promise<{ xpEarned: number; newAchievements: string[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    // Check if already visited
    if (visitedLocationIds.includes(locationId)) {
      return { xpEarned: 0, newAchievements: [] };
    }

    const location = locations.find(l => l.id === locationId);
    if (!location) throw new Error("Location not found");

    // Record visit
    await supabase.from("user_location_visits").insert({
      user_id: user.id,
      location_id: locationId,
    });

    // Add XP
    await supabase.rpc("add_user_xp", { p_user_id: user.id, p_xp: location.xpReward });

    // Update locations visited count
    await supabase
      .from("user_progress")
      .update({ locations_visited: visitedLocationIds.length + 1 })
      .eq("user_id", user.id);

    // Check for new achievements
    const newAchievements = await checkAchievements();

    // Refresh state
    setVisitedLocationIds(prev => [...prev, locationId]);
    
    await refreshProgress();

    return { xpEarned: location.xpReward, newAchievements };
  }, [supabase, visitedLocationIds, locations, refreshProgress]);

  // Start a quest
  const startQuest = useCallback(async (questId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    await supabase.from("user_quests").insert({
      user_id: user.id,
      quest_id: questId,
      status: 'active',
      current_step: 0,
    });

    await refreshProgress();
  }, [supabase, refreshProgress]);

  // Complete a quest step
  const completeQuestStep = useCallback(async (questId: string, stepIndex: number): Promise<{ xpEarned: number; questCompleted: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    const userQuest = userQuests.find(uq => uq.questId === questId);
    if (!userQuest) throw new Error("Quest not started");

    const quest = quests.find(q => q.id === questId);
    if (!quest) throw new Error("Quest not found");

    const newStepsCompleted = [...userQuest.stepsCompleted, stepIndex];
    const questCompleted = newStepsCompleted.length >= quest.steps.length;

    // Update quest progress
    await supabase
      .from("user_quests")
      .update({
        current_step: stepIndex + 1,
        steps_completed: newStepsCompleted,
        status: questCompleted ? 'completed' : 'active',
        completed_at: questCompleted ? new Date().toISOString() : null,
      })
      .eq("id", userQuest.id);

    let xpEarned = 25; // XP per step
    if (questCompleted) {
      xpEarned = quest.xpReward;
      
      // Update quests completed count
      await supabase
        .from("user_progress")
        .update({ quests_completed: (gameState?.questsCompleted || 0) + 1 })
        .eq("user_id", user.id);
    }

    await supabase.rpc("add_user_xp", { p_user_id: user.id, p_xp: xpEarned });
    await refreshProgress();

    return { xpEarned, questCompleted };
  }, [supabase, userQuests, quests, gameState, refreshProgress]);

  // Upload a photo
  const uploadPhoto = useCallback(async (
    file: File, 
    type: string, 
    locationId?: string, 
    caption?: string
  ): Promise<UserPhoto> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    // Upload to storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("user-photos")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("user-photos")
      .getPublicUrl(fileName);

    // Insert photo record
    const xpEarned = type === 'achievement' ? 15 : 10;
    const { data: photo, error: insertError } = await supabase
      .from("user_photos")
      .insert({
        user_id: user.id,
        location_id: locationId,
        photo_url: publicUrl,
        photo_type: type,
        caption,
        xp_earned: xpEarned,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Add XP
    await supabase.rpc("add_user_xp", { p_user_id: user.id, p_xp: xpEarned });

    // Update photos count
    await supabase
      .from("user_progress")
      .update({ photos_taken: (gameState?.photosTaken || 0) + 1 })
      .eq("user_id", user.id);

    await refreshProgress();

    return {
      id: photo.id,
      locationId: photo.location_id,
      photoUrl: photo.photo_url,
      photoType: photo.photo_type,
      caption: photo.caption,
      isPublic: photo.is_public,
      xpEarned: photo.xp_earned,
      createdAt: photo.created_at,
    };
  }, [supabase, gameState, refreshProgress]);

  // Learn a Georgian phrase
  const learnPhrase = useCallback(async (phrase: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    const currentPhrases = gameState?.phrasesLearned || [];
    if (currentPhrases.includes(phrase)) return;

    const newPhrases = [...currentPhrases, phrase];
    
    await supabase
      .from("user_progress")
      .update({ phrases_learned: newPhrases })
      .eq("user_id", user.id);

    // Add XP for learning
    await supabase.rpc("add_user_xp", { p_user_id: user.id, p_xp: 15 });

    await refreshProgress();
  }, [supabase, gameState, refreshProgress]);

  // Check and award achievements
  const checkAchievements = useCallback(async (): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const newAchievements: string[] = [];

    for (const achievement of achievements) {
      // Skip already earned
      if (userAchievements.includes(achievement.id)) continue;

      let earned = false;

      // Check requirements based on type
      switch (achievement.slug) {
        case 'first_steps':
          earned = visitedLocationIds.length >= 1;
          break;
        case 'getting_around':
          earned = visitedLocationIds.length >= 5;
          break;
        case 'explorer':
          earned = visitedLocationIds.length >= 10;
          break;
        case 'first_photo':
          earned = userPhotos.length >= 1;
          break;
        case 'photographer':
          earned = userPhotos.length >= 10;
          break;
        case 'polyglot_beginner':
          earned = (gameState?.phrasesLearned.length || 0) >= 1;
          break;
        case 'polyglot':
          earned = (gameState?.phrasesLearned.length || 0) >= 5;
          break;
        case 'polyglot_master':
          earned = (gameState?.phrasesLearned.length || 0) >= 10;
          break;
        // Add more achievement checks as needed
      }

      if (earned) {
        // Award achievement
        await supabase.from("user_achievements").insert({
          user_id: user.id,
          achievement_id: achievement.id,
        });

        // Add XP
        await supabase.rpc("add_user_xp", { p_user_id: user.id, p_xp: achievement.xpReward });

        newAchievements.push(achievement.name);
      }
    }

    if (newAchievements.length > 0) {
      // Update achievements count
      await supabase
        .from("user_progress")
        .update({ achievements_earned: userAchievements.length + newAchievements.length })
        .eq("user_id", user.id);
    }

    return newAchievements;
  }, [supabase, achievements, userAchievements, visitedLocationIds, userPhotos, gameState]);

  // Initial load
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  return {
    isLoading,
    error,
    gameState,
    locations,
    achievements,
    userAchievements,
    quests,
    userQuests,
    userPhotos,
    visitedLocationIds,
    refreshProgress,
    visitLocation,
    startQuest,
    completeQuestStep,
    uploadPhoto,
    learnPhrase,
    checkAchievements,
  };
}

export default useGameProgress;





