"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useGeminiLive, ToolHandlers } from "@/hooks/useGeminiLive";
import { useGameProgress } from "@/hooks/queries/useGameProgress";
import { useAchievements } from "@/hooks/queries/useAchievements";
import { useVisitedLocations } from "@/hooks/queries/useVisitedLocations";
import { useLocations } from "@/hooks/queries/useLocations";
import { useQuests, useUserQuests } from "@/hooks/queries/useQuests";
import { useVisitLocation } from "@/hooks/mutations/useVisitLocation";
import { useLearnPhrase } from "@/hooks/mutations/useLearnPhrase";
import { useStartQuest } from "@/hooks/mutations/useQuestMutations";
import { useUploadPhoto } from "@/hooks/mutations/usePhotoMutations";
import { useMessageProcessor } from "@/hooks/useMessageProcessor";
import { GameProgressBar } from "@/components/GameProgressBar";
import { PhotoCapture } from "@/components/PhotoCapture";
import { AchievementToast } from "@/components/AchievementToast";
import { GameActions } from "@/components/GameActions";
import { MapDrawer, mapDrawerController } from "@/components/MapDrawer";
import Link from "next/link";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

interface AchievementNotification {
  id: string;
  name: string;
  icon: string;
  xp: number;
  isSecret?: boolean;
}

export default function LivePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoFrameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [textInput, setTextInput] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [hasVideo, setHasVideo] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState<AchievementNotification[]>([]);

  // Query hooks for data fetching
  const { data: gameProgress, isLoading: progressLoading } = useGameProgress(isAuthenticated);
  const { data: achievementsData } = useAchievements(isAuthenticated);
  const { data: visitedData } = useVisitedLocations(isAuthenticated);
  const { data: locationsData } = useLocations();
  const { data: questsData } = useQuests();
  const { data: userQuestsData } = useUserQuests(isAuthenticated);

  // Mutation hooks
  const visitLocationMutation = useVisitLocation();
  const learnPhraseMutation = useLearnPhrase();
  const startQuestMutation = useStartQuest();
  const uploadPhotoMutation = useUploadPhoto();

  // Transform data for components
  const achievements = useMemo(
    () => achievementsData?.achievements || [],
    [achievementsData]
  );

  const userAchievements = useMemo(
    () => achievements.filter((a) => a.earned).map((a) => a.id),
    [achievements]
  );

  const locations = useMemo(
    () => locationsData?.locations || [],
    [locationsData]
  );

  const visitedLocationIds = useMemo(
    () => visitedData?.visits?.map((v) => v.location_id) || [],
    [visitedData]
  );

  const quests = useMemo(
    () => questsData?.quests || [],
    [questsData]
  );

  const userQuests = useMemo(
    () => [...(userQuestsData?.active || []), ...(userQuestsData?.completed || [])],
    [userQuestsData]
  );

  // Game state for components (transformed from API response)
  const gameState = useMemo(() => {
    if (!gameProgress) return null;
    return {
      totalXp: gameProgress.total_xp,
      currentLevel: gameProgress.current_level,
      currentRank: gameProgress.current_rank,
      locationsVisited: gameProgress.locations_visited,
      photosTaken: gameProgress.photos_taken,
      questsCompleted: gameProgress.quests_completed,
      achievementsEarned: gameProgress.achievements_earned || 0,
      phrasesLearned: gameProgress.phrases_learned || [],
      activeQuests: userQuestsData?.active?.map((q) => q.quest?.name || "") || [],
      completedAchievements: userAchievements,
    };
  }, [gameProgress, userQuestsData, userAchievements]);

  // Show achievement notification
  const showAchievement = useCallback((achievement: AchievementNotification) => {
    setAchievementNotifications((prev) => [...prev, achievement]);
  }, []);

  const dismissAchievement = useCallback((id: string) => {
    setAchievementNotifications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Visit location handler
  const handleVisitLocation = useCallback(
    async (locationId: string) => {
      const result = await visitLocationMutation.mutateAsync({ locationId });

      // Show achievement notifications
      if (result.new_achievements?.length > 0) {
        result.new_achievements.forEach((ach: any) => {
          const achievement = achievements.find(
            (a) => a.name === ach.name || a.id === ach.id
          );
          if (achievement) {
            showAchievement({
              id: achievement.id,
              name: achievement.name,
              icon: achievement.icon,
              xp: achievement.xp_reward,
              isSecret: achievement.is_secret,
            });
          }
        });
      }

      return {
        xpEarned: result.xp_earned,
        newAchievements: result.new_achievements?.map((a: any) => a.name) || [],
      };
    },
    [visitLocationMutation, achievements, showAchievement]
  );

  // Learn phrase handler
  const handleLearnPhrase = useCallback(
    async (phrase: string, meaning?: string) => {
      await learnPhraseMutation.mutateAsync({ phrase, meaning });
    },
    [learnPhraseMutation]
  );

  // Start quest handler
  const handleStartQuest = useCallback(
    async (questId: string) => {
      await startQuestMutation.mutateAsync(questId);
    },
    [startQuestMutation]
  );

  // Message processor
  const { processMessage } = useMessageProcessor({
    locations: locations.map((l) => ({
      id: l.id,
      name: l.name,
      nameKa: l.name_ka,
      description: l.description,
      category: l.category,
      xpReward: l.xp_reward,
      imageUrl: l.image_url,
    })),
    visitedLocationIds,
    phrasesLearned: gameState?.phrasesLearned || [],
    onVisitLocation: handleVisitLocation,
    onLearnPhrase: handleLearnPhrase,
    onAchievementEarned: (achievement) => {
      showAchievement({
        id: achievement.id,
        name: achievement.name,
        icon: achievement.icon,
        xp: achievement.xpReward,
        isSecret: achievement.isSecret,
      });
    },
    achievements: achievements.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      xpReward: a.xp_reward,
      category: a.category,
      isSecret: a.is_secret,
    })),
  });

  // Build context for AI
  const visitedLocationsContext = useMemo(() => {
    if (!locations.length) return "";
    const visited = locations.filter((l) => visitedLocationIds.includes(l.id));
    const notVisited = locations.filter((l) => !visitedLocationIds.includes(l.id));
    return `
## User's Exploration Progress
The user has already visited these places (don't suggest them again, but you can reference their experience):
${visited.length > 0 ? visited.map((l) => `- ${l.name}`).join("\n") : "- None yet"}

Places the user hasn't visited yet (suggest these!):
${notVisited.slice(0, 8).map((l) => `- ${l.name}`).join("\n")}

IMPORTANT: When the user tells you they visited somewhere, are at a location, checked in, or arrived at a place, you MUST call the visit_location function to record their visit and award XP. Always call the function first, then respond based on the result.

When the user asks to learn Georgian, teach them a phrase and then call learn_phrase when they acknowledge learning it.
    `;
  }, [locations, visitedLocationIds]);

  // Tool handlers for Gemini
  const toolHandlers: ToolHandlers = useMemo(
    () => ({
      visit_location: async (args) => {
        console.log("[TOOL HANDLER] 📍 visit_location called:", args.location_name);

        const location = locations.find(
          (l) =>
            l.name.toLowerCase().includes(args.location_name.toLowerCase()) ||
            args.location_name.toLowerCase().includes(l.name.toLowerCase())
        );

        if (!location) {
          return {
            success: false,
            xp_earned: 0,
            message: `Location "${args.location_name}" not found.`,
          };
        }

        if (visitedLocationIds.includes(location.id)) {
          return {
            success: true,
            xp_earned: 0,
            message: `You've already visited ${location.name}!`,
          };
        }

        try {
          const result = await visitLocationMutation.mutateAsync({
            locationId: location.id,
          });

          if (result.new_achievements?.length > 0) {
            result.new_achievements.forEach((ach: any) => {
              const achievement = achievements.find((a) => a.name === ach.name);
              if (achievement) {
                showAchievement({
                  id: achievement.id,
                  name: achievement.name,
                  icon: achievement.icon,
                  xp: achievement.xp_reward,
                  isSecret: achievement.is_secret,
                });
              }
            });
          }

          return {
            success: true,
            xp_earned: result.xp_earned,
            message: result.message,
          };
        } catch (err) {
          return {
            success: false,
            xp_earned: 0,
            message: "Failed to record visit.",
          };
        }
      },

      learn_phrase: async (args) => {
        console.log("[TOOL HANDLER] 🗣️ learn_phrase called:", args.phrase);

        if (gameState?.phrasesLearned.includes(args.phrase)) {
          return {
            success: true,
            xp_earned: 0,
            message: `You've already learned "${args.phrase}"!`,
          };
        }

        try {
          const result = await learnPhraseMutation.mutateAsync({
            phrase: args.phrase,
            meaning: args.meaning,
          });
          return {
            success: result.success,
            xp_earned: result.xp_earned || 10,
            message: `Great job learning "${args.phrase}"! Earned ${
              result.xp_earned || 10
            } XP.`,
          };
        } catch (err) {
          return {
            success: false,
            xp_earned: 0,
            message: "Failed to save phrase.",
          };
        }
      },

      start_quest: async (args) => {
        console.log("[TOOL HANDLER] 📜 start_quest called:", args.quest_name);

        const quest = quests.find(
          (q) =>
            q.name.toLowerCase().includes(args.quest_name.toLowerCase()) ||
            args.quest_name.toLowerCase().includes(q.name.toLowerCase())
        );

        if (!quest) {
          return {
            success: false,
            message: `Quest "${args.quest_name}" not found.`,
          };
        }

        const existingQuest = userQuests.find((uq) => uq.quest_id === quest.id);
        if (existingQuest) {
          return {
            success: true,
            message: `You've already ${
              existingQuest.status === "completed" ? "completed" : "started"
            } "${quest.name}".`,
          };
        }

        try {
          await startQuestMutation.mutateAsync(quest.id);
          return {
            success: true,
            message: `Quest "${quest.name}" has begun! ${
              quest.story_intro || ""
            }`,
          };
        } catch (err) {
          return { success: false, message: "Failed to start quest." };
        }
      },

      get_user_progress: async () => {
        return {
          level: gameState?.currentLevel || 1,
          xp: gameState?.totalXp || 0,
          rank: gameState?.currentRank || "Tourist",
          locations_visited: gameState?.locationsVisited || 0,
          photos_taken: gameState?.photosTaken || 0,
          quests_completed: gameState?.questsCompleted || 0,
          achievements_earned: gameState?.achievementsEarned || 0,
          phrases_learned: gameState?.phrasesLearned.length || 0,
        };
      },

      get_knowledge: async (args) => {
        console.log("[TOOL HANDLER] 📚 get_knowledge called:", args.query);

        try {
          const response = await fetch("/api/rag/context", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: args.query, max_chunks: 5 }),
          });

          if (!response.ok) {
            console.error("[TOOL HANDLER] ❌ RAG query failed:", response.status);
            return { found: false, context: "", sources: [] };
          }

          const data = await response.json();
          console.log(
            "[TOOL HANDLER] 📖 RAG context received, source:",
            data.source
          );

          const sourceMatches =
            data.context.match(/\*\*Source \d+\*\* \(([^)]+)\)/g) || [];
          const sources = sourceMatches.map((m: string) => {
            const match = m.match(/\(([^)]+)\)/);
            return match ? match[1] : "Unknown";
          });

          return {
            found: data.context.length > 0,
            context: data.context,
            sources: sources,
          };
        } catch (error) {
          console.error("[TOOL HANDLER] ❌ RAG query error:", error);
          return { found: false, context: "", sources: [] };
        }
      },

      display_location_on_map: async (args) => {
        console.log(
          "[TOOL HANDLER] 🗺️ display_location_on_map called:",
          args.location_id
        );

        const location = locations.find(
          (l) =>
            l.id === args.location_id ||
            l.name.toLowerCase().includes(args.location_id.toLowerCase()) ||
            args.location_id.toLowerCase().includes(l.name.toLowerCase())
        );

        if (!location) {
          console.warn(
            "[TOOL HANDLER] ⚠️ Location not found:",
            args.location_id
          );
          return {
            success: false,
            message: `Location "${args.location_id}" not found in database. Try using a known location name.`,
          };
        }

        mapDrawerController.open(location.id);

        return {
          success: true,
          message: `Showing ${location.name} on the map. The user can now see its location and get directions.`,
        };
      },
    }),
    [
      locations,
      visitedLocationIds,
      visitLocationMutation,
      learnPhraseMutation,
      startQuestMutation,
      quests,
      userQuests,
      gameState,
      achievements,
      showAchievement,
    ]
  );

  // Gemini Live hook
  const {
    isConnected,
    isConnecting,
    isMuted,
    isVideoEnabled,
    messages,
    mediaStream,
    connect,
    disconnect,
    sendTextMessage,
    sendVideoFrame,
    toggleMute,
    toggleVideo,
  } = useGeminiLive({
    apiKey: GEMINI_API_KEY,
    promptConfig: {
      gameState: gameState || undefined,
      customContext: visitedLocationsContext,
    },
    toolHandlers,
    onToolCall: (toolCall) => {
      console.log("[UI] 🔧 Tool called:", toolCall.name, toolCall.args);
    },
    onError: (err) => {
      console.error("Live API Error:", err);
      setError(err.message || "Connection failed");
    },
    onStatusChange: (newStatus) => {
      setStatus(newStatus);
      setError("");
    },
  });

  // Check auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Attach media stream to video element
  useEffect(() => {
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      setHasVideo(videoTracks.length > 0);

      if (videoRef.current && videoTracks.length > 0) {
        // @ts-ignore
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } else {
      setHasVideo(false);
    }
  }, [mediaStream]);

  // Send video frames periodically
  useEffect(() => {
    if (isConnected && isVideoEnabled && videoRef.current) {
      videoFrameIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          sendVideoFrame(videoRef.current);
        }
      }, 1000);
    }

    return () => {
      if (videoFrameIntervalRef.current) {
        clearInterval(videoFrameIntervalRef.current);
      }
    };
  }, [isConnected, isVideoEnabled, sendVideoFrame]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Process messages for game events
  const lastProcessedMessageRef = useRef<string | null>(null);
  useEffect(() => {
    const processNewMessages = async () => {
      if (messages.length === 0) return;

      const lastMessage = messages[messages.length - 1];
      if (lastProcessedMessageRef.current === lastMessage.id) return;
      lastProcessedMessageRef.current = lastMessage.id;

      await processMessage(lastMessage.content, lastMessage.role);
    };

    processNewMessages();
  }, [messages, processMessage]);

  const handleConnect = () => {
    if (!GEMINI_API_KEY) {
      setError("Gemini API key is not configured.");
      return;
    }
    setError("");
    setStatus("");
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
    setStatus("");
    setError("");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendTextMessage(textInput);
      setTextInput("");
    }
  };

  const handlePhotoUploadComplete = useCallback(() => {
    // Mutation already refreshes data; hook here if you want extra effects
  }, []);

  if (authLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Get active quest info
  const activeQuest = userQuests.find((uq) => uq.status === "active");
  const activeQuestDef = activeQuest
    ? quests.find((q) => q.id === activeQuest.quest_id)
    : null;

  // Transform data for GameActions component
  const achievementsForActions = achievements.map((a) => ({
    id: a.id,
    slug: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    xpReward: a.xp_reward,
    category: a.category,
    isSecret: a.is_secret,
  }));

  const questsForActions = quests.map((q) => ({
    id: q.id,
    slug: q.id,
    name: q.name,
    description: q.description,
    storyIntro: q.story_intro || null,
    questType: q.difficulty || "normal",
    xpReward: q.xp_reward,
    steps: q.steps,
    isActive: true,
  }));

  const userQuestsForActions = userQuests.map((uq) => ({
    id: uq.id,
    questId: uq.quest_id,
    status: uq.status,
    currentStep: uq.current_step,
    stepsCompleted: [],
    startedAt: uq.started_at,
    completedAt: uq.completed_at || null,
    quest: uq.quest as any,
  }));

  const locationsForActions = locations.map((l) => ({
    id: l.id,
    name: l.name,
    nameKa: l.name_ka || null,
    description: l.description || null,
    category: l.category,
    xpReward: l.xp_reward,
    imageUrl: l.image_url || null,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background photo using image2.jpg */}
      <div className="absolute inset-0">
        <Image
          src="/image2.jpg"
          alt="Poti view"
          fill
          priority
          className="object-cover"
        />
        {/* Blue/sea overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-sky-950/80 to-slate-950/90" />
      </div>

      {/* Ambient blue effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/25 rounded-full mix-blend-screen blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/25 rounded-full mix-blend-screen blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/15 rounded-full mix-blend-screen blur-3xl" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-slate-950/70">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-sky-400/40 flex items-center justify-center shadow-lg shadow-sky-900/60 group-hover:shadow-sky-400/70 transition-shadow">
                <span className="text-xl">⚓</span>
              </div>
              <span className="text-white font-semibold text-lg hidden sm:inline">
                Poti Guide
              </span>
            </Link>

            <div className="flex-1 max-w-xs mx-4 hidden md:block">
              <GameProgressBar gameState={gameState} compact />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-sky-400/40">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected
                      ? "bg-green-400 animate-pulse"
                      : isConnecting
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-slate-500"
                  }`}
                ></div>
                <span className="text-sm text-slate-300 hidden sm:inline">
                  {isConnected
                    ? "Live"
                    : isConnecting
                    ? "Connecting..."
                    : "Offline"}
                </span>
              </div>

              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-lg bg-slate-900/80 border border-sky-400/40 text-slate-100 hover:bg-slate-900 transition-all lg:hidden"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full ring-2 ring-sky-400/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-4 h-[calc(100vh-100px)]">
            {/* Left Sidebar */}
            <div
              className={`${
                showSidebar ? "block" : "hidden"
              } lg:block w-full lg:w-72 flex-shrink-0 space-y-4 absolute lg:relative inset-0 lg:inset-auto z-20 lg:z-auto bg-slate-950/95 lg:bg-transparent p-4 lg:p-0 overflow-y-auto rounded-3xl lg:rounded-none`}
            >
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-slate-900/80 text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <GameProgressBar gameState={gameState} />

              {activeQuestDef && (
                <div className="backdrop-blur-xl bg-slate-950/70 border border-sky-400/40 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📜</span>
                    <h3 className="text-white font-semibold">Active Quest</h3>
                  </div>
                  <p className="text-white text-sm font-medium">
                    {activeQuestDef.name}
                  </p>
                  <p className="text-slate-300 text-xs mt-1">
                    Step {(activeQuest?.current_step || 0) + 1} of{" "}
                    {activeQuestDef.steps.length}
                  </p>
                  <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                      style={{
                        width: `${
                          ((activeQuest?.current_step || 0) /
                            activeQuestDef.steps.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="backdrop-blur-xl bg-slate-950/75 border border-sky-400/30 rounded-2xl overflow-hidden flex-1 min-h-0">
                <GameActions
                  locations={locationsForActions}
                  visitedLocationIds={visitedLocationIds}
                  achievements={achievementsForActions}
                  userAchievements={userAchievements}
                  quests={questsForActions}
                  userQuests={userQuestsForActions}
                  phrasesLearned={gameState?.phrasesLearned || []}
                  onVisitLocation={handleVisitLocation}
                  onStartQuest={handleStartQuest}
                  onLearnPhrase={handleLearnPhrase}
                  onAchievementEarned={(achievement) => {
                    showAchievement({
                      id: achievement.id,
                      name: achievement.name,
                      icon: achievement.icon,
                      xp: achievement.xpReward,
                      isSecret: achievement.isSecret,
                    });
                  }}
                />
              </div>
            </div>

            {/* Center - Video & Controls */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* Achievement Notifications */}
              {achievementNotifications.map((notification) => (
                <AchievementToast
                  key={notification.id}
                  name={notification.name}
                  icon={notification.icon}
                  xp={notification.xp}
                  isSecret={notification.isSecret}
                  onClose={() => dismissAchievement(notification.id)}
                />
              ))}

              <div className="relative flex-1 backdrop-blur-xl bg-slate-950/70 border border-sky-400/30 rounded-3xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover ${
                    !mediaStream || !isVideoEnabled || !hasVideo ? "opacity-0" : ""
                  }`}
                />

                {!isConnected && !isConnecting && !mediaStream ? (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="max-w-md w-full text-center">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-slate-900/80 border border-sky-400/40 flex items-center justify-center shadow-xl shadow-sky-900/60">
                        <span className="text-5xl">⚓</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome, {gameState?.currentRank || "Traveler"}!
                      </h2>
                      <p className="text-slate-300 mb-6">
                        Start your adventure in Poti with your AI guide.
                      </p>

                      {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                          {error}
                        </div>
                      )}

                      <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-900/50 hover:shadow-sky-400/60"
                      >
                        <span className="text-xl">🎙️</span>
                        Start Adventure
                      </button>

                      <p className="mt-4 text-xs text-slate-400">
                        Camera and microphone access will be requested.
                      </p>
                    </div>
                  </div>
                ) : isConnecting ? (
                  <div className="absolute inset-0 flex items-center justify-center p-8 bg-slate-950/70 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                      <p className="text-white font-medium">
                        {status || "Connecting to Gemini..."}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Preparing your guide
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {(!isVideoEnabled || !hasVideo) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center">
                            <span className="text-4xl animate-bounce-slow">
                              🎙️
                            </span>
                          </div>
                          <p className="text-white font-medium">Listening...</p>
                          <p className="text-slate-400 text-sm mt-1">
                            {hasVideo ? "Camera is off" : "Audio-only mode"}
                          </p>
                        </div>
                      </div>
                    )}

                    {isConnected && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40">
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                        <span className="text-sm text-red-300 font-medium">
                          LIVE
                        </span>
                      </div>
                    )}

                    {isConnected && gameState && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                        <span className="text-amber-200 font-bold text-sm">
                          {gameState.totalXp} XP
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {isConnected && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={toggleMute}
                    className={`p-4 rounded-2xl transition-all duration-300 ${
                      isMuted
                        ? "bg-red-500/20 border border-red-500/40 text-red-300"
                        : "bg-slate-950/70 border border-sky-400/40 text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    {isMuted ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-2xl transition-all duration-300 ${
                      !isVideoEnabled
                        ? "bg-red-500/20 border border-red-500/40 text-red-300"
                        : "bg-slate-950/70 border border-sky-400/40 text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>

                  <PhotoCapture
                    videoStream={mediaStream}
                    isCapturing={false}
                    onUploadComplete={handlePhotoUploadComplete}
                  />

                  <button
                    onClick={handleDisconnect}
                    className="p-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Right - Chat Panel */}
            <div className="hidden lg:flex w-80 flex-shrink-0 flex-col backdrop-blur-xl bg-slate-950/75 border border-sky-400/30 rounded-3xl overflow-hidden">
              <div className="px-4 py-3 border-b border-sky-400/30">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <span>💬</span> Chat
                </h2>
                <p className="text-xs text-slate-300">
                  {isConnected ? "Speak or type" : "Connect to chat"}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-900/80 flex items-center justify-center">
                      <span className="text-2xl">💭</span>
                    </div>
                    <p className="text-slate-300 text-sm">No messages yet</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Start talking to your guide!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950"
                            : "bg-slate-900/80 text-slate-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-slate-800/80"
                              : "text-slate-400"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {isConnected && (
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-sky-400/30"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-transparent text-sm"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 rounded-xl transition-all duration-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>

        {/* Map Drawer - controlled by AI via display_location_on_map tool */}
        <MapDrawer />
      </div>
    </div>
  );
}
