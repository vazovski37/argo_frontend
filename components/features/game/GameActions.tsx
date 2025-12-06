"use client";

import { useState, useCallback } from "react";

// Types for game entities
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

interface GameActionsProps {
  locations: Location[];
  visitedLocationIds: string[];
  achievements: Achievement[];
  userAchievements: string[];
  quests: Quest[];
  userQuests: UserQuest[];
  phrasesLearned: string[];
  onVisitLocation: (locationId: string) => Promise<{ xpEarned: number; newAchievements: string[] }>;
  onStartQuest: (questId: string) => Promise<void>;
  onLearnPhrase: (phrase: string) => Promise<void>;
  onAchievementEarned?: (achievement: Achievement) => void;
}

const GEORGIAN_PHRASES = [
  { phrase: "გამარჯობა", transliteration: "Gamarjoba", meaning: "Hello" },
  { phrase: "მადლობა", transliteration: "Madloba", meaning: "Thank you" },
  { phrase: "დიახ", transliteration: "Diakh", meaning: "Yes" },
  { phrase: "არა", transliteration: "Ara", meaning: "No" },
  { phrase: "გაუმარჯოს", transliteration: "Gaumarjos", meaning: "Cheers!" },
  { phrase: "რამდენია?", transliteration: "Ramdenia?", meaning: "How much?" },
  { phrase: "გმადლობთ", transliteration: "Gmadlobt", meaning: "Thank you (formal)" },
  { phrase: "კარგი", transliteration: "Kargi", meaning: "Good/Okay" },
  { phrase: "ნახვამდის", transliteration: "Nakhvamdis", meaning: "Goodbye" },
  { phrase: "ბოდიში", transliteration: "Bodishi", meaning: "Sorry/Excuse me" },
];

export function GameActions({
  locations,
  visitedLocationIds,
  achievements,
  userAchievements,
  quests,
  userQuests,
  phrasesLearned,
  onVisitLocation,
  onStartQuest,
  onLearnPhrase,
  onAchievementEarned,
}: GameActionsProps) {
  const [activeTab, setActiveTab] = useState<"locations" | "achievements" | "quests" | "phrases">("locations");
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Group locations by category
  const locationsByCategory = locations.reduce((acc, loc) => {
    if (!acc[loc.category]) acc[loc.category] = [];
    acc[loc.category].push(loc);
    return acc;
  }, {} as Record<string, Location[]>);

  // Handle location check-in
  const handleCheckIn = useCallback(async (location: Location) => {
    if (visitedLocationIds.includes(location.id)) return;
    
    setIsProcessing(true);
    try {
      const result = await onVisitLocation(location.id);
      setNotification({
        type: "success",
        message: `+${result.xpEarned} XP! You visited ${location.name}`,
      });

      if (result.newAchievements.length > 0 && onAchievementEarned) {
        result.newAchievements.forEach(achievementName => {
          const achievement = achievements.find(a => a.name === achievementName);
          if (achievement) onAchievementEarned(achievement);
        });
      }

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: "error", message: "Failed to check in" });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [visitedLocationIds, onVisitLocation, achievements, onAchievementEarned]);

  // Handle starting a quest
  const handleStartQuest = useCallback(async (quest: Quest) => {
    const existingQuest = userQuests.find(uq => uq.questId === quest.id);
    if (existingQuest) return;

    setIsProcessing(true);
    try {
      await onStartQuest(quest.id);
      setNotification({
        type: "success",
        message: `Quest started: ${quest.name}`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: "error", message: "Failed to start quest" });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [userQuests, onStartQuest]);

  // Handle learning a phrase
  const handleLearnPhrase = useCallback(async (phrase: string) => {
    if (phrasesLearned.includes(phrase)) return;

    setIsProcessing(true);
    try {
      await onLearnPhrase(phrase);
      setNotification({
        type: "success",
        message: `+15 XP! You learned a new phrase!`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: "error", message: "Failed to save phrase" });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [phrasesLearned, onLearnPhrase]);

  const categoryIcons: Record<string, string> = {
    landmark: "🏛️",
    restaurant: "🍽️",
    nature: "🌿",
    historical: "📜",
    viewpoint: "🌅",
    hidden_gem: "💎",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Notification */}
      {notification && (
        <div className={`mx-4 mt-4 p-3 rounded-xl text-sm ${
          notification.type === "success" 
            ? "bg-green-500/20 border border-green-500/30 text-green-400"
            : "bg-red-500/20 border border-red-500/30 text-red-400"
        }`}>
          {notification.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-white/10">
        {[
          { id: "locations", label: "🗺️ Places", count: locations.length },
          { id: "achievements", label: "🏆 Badges", count: achievements.length },
          { id: "quests", label: "📜 Quests", count: quests.length },
          { id: "phrases", label: "🗣️ Phrases", count: GEORGIAN_PHRASES.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Locations Tab */}
        {activeTab === "locations" && (
          <div className="space-y-4">
            {Object.entries(locationsByCategory).map(([category, locs]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>{categoryIcons[category] || "📍"}</span>
                  {category.replace("_", " ")}
                </h4>
                <div className="space-y-2">
                  {locs.map((location) => {
                    const visited = visitedLocationIds.includes(location.id);
                    return (
                      <button
                        key={location.id}
                        onClick={() => !visited && handleCheckIn(location)}
                        disabled={visited || isProcessing}
                        className={`w-full text-left p-3 rounded-xl transition-all ${
                          visited
                            ? "bg-green-500/10 border border-green-500/20"
                            : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30"
                        } disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm truncate ${visited ? "text-green-400" : "text-white"}`}>
                              {visited && "✓ "}{location.name}
                            </p>
                            {location.nameKa && (
                              <p className="text-xs text-slate-500 truncate">{location.nameKa}</p>
                            )}
                          </div>
                          {!visited && (
                            <span className="text-xs text-amber-400 font-medium ml-2">
                              +{location.xpReward} XP
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-2">
            {achievements.filter(a => !a.isSecret || userAchievements.includes(a.id)).map((achievement) => {
              const earned = userAchievements.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl ${
                    earned
                      ? "bg-amber-500/10 border border-amber-500/20"
                      : "bg-white/5 border border-white/10 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      earned 
                        ? "bg-gradient-to-br from-amber-500/30 to-orange-500/30" 
                        : "bg-white/10"
                    }`}>
                      {earned ? achievement.icon : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${earned ? "text-amber-300" : "text-slate-400"}`}>
                        {achievement.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{achievement.description}</p>
                    </div>
                    <span className={`text-xs font-medium ${earned ? "text-amber-400" : "text-slate-500"}`}>
                      {achievement.xpReward} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quests Tab */}
        {activeTab === "quests" && (
          <div className="space-y-3">
            {quests.map((quest) => {
              const userQuest = userQuests.find(uq => uq.questId === quest.id);
              const status = userQuest?.status || "available";
              const progress = userQuest ? (userQuest.currentStep / quest.steps.length) * 100 : 0;
              
              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-xl border ${
                    status === "completed"
                      ? "bg-green-500/10 border-green-500/20"
                      : status === "active"
                      ? "bg-purple-500/10 border-purple-500/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        quest.questType === "main" 
                          ? "bg-amber-500/20 text-amber-400" 
                          : "bg-slate-500/20 text-slate-400"
                      }`}>
                        {quest.questType}
                      </span>
                    </div>
                    <span className="text-xs text-amber-400 font-medium">
                      {quest.xpReward} XP
                    </span>
                  </div>
                  
                  <h4 className="text-white font-medium mb-1">{quest.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">{quest.description}</p>
                  
                  {status === "active" && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{userQuest?.currentStep || 0}/{quest.steps.length} steps</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {status === "available" && (
                    <button
                      onClick={() => handleStartQuest(quest)}
                      disabled={isProcessing}
                      className="w-full py-2 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                    >
                      Start Quest
                    </button>
                  )}
                  
                  {status === "completed" && (
                    <div className="text-center text-green-400 text-sm font-medium">
                      ✓ Completed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Phrases Tab */}
        {activeTab === "phrases" && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 mb-3">
              Learn Georgian phrases! Tap to mark as learned and earn XP.
            </p>
            {GEORGIAN_PHRASES.map((item) => {
              const learned = phrasesLearned.includes(item.phrase);
              return (
                <button
                  key={item.phrase}
                  onClick={() => !learned && handleLearnPhrase(item.phrase)}
                  disabled={learned || isProcessing}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    learned
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30"
                  } disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${learned ? "text-green-400" : "text-white"}`}>
                        {learned && "✓ "}{item.phrase}
                      </p>
                      <p className="text-sm text-slate-400">{item.transliteration}</p>
                      <p className="text-xs text-slate-500">{item.meaning}</p>
                    </div>
                    {!learned && (
                      <span className="text-xs text-amber-400 font-medium">+15 XP</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameActions;





