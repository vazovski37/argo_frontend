"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuests, useUserQuests } from "@/hooks/queries/useQuests";
import { useStartQuest } from "@/hooks/mutations/useQuestMutations";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Badge, LoadingSpinner } from "@/components/ui";
import { BookOpen, Clock, Trophy, Star, CheckCircle2, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Quest, UserQuest } from "@/lib/schemas/quests";

export default function QuestsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  const { data: questsData, isLoading: questsLoading } = useQuests(true, isAuthenticated);
  const { data: userQuestsData, isLoading: userQuestsLoading } = useUserQuests(isAuthenticated);
  const startQuestMutation = useStartQuest();

  const allQuests = questsData?.quests || [];
  const activeQuests = userQuestsData?.active || [];
  const completedQuests = userQuestsData?.completed || [];

  const getQuestStatus = (questId: string): "available" | "active" | "completed" => {
    const active = activeQuests.find((uq) => uq.quest_id === questId);
    if (active) return "active";
    const completed = completedQuests.find((uq) => uq.quest_id === questId);
    if (completed) return "completed";
    return "available";
  };

  const handleStartQuest = async (questId: string) => {
    try {
      await startQuestMutation.mutateAsync(questId);
      router.push(`/quests/${questId}`);
    } catch (error) {
      console.error("Failed to start quest:", error);
    }
  };

  const getFilteredQuests = () => {
    if (activeTab === "active") {
      return activeQuests.map((uq) => uq.quest).filter(Boolean) as Quest[];
    }
    if (activeTab === "completed") {
      return completedQuests.map((uq) => uq.quest).filter(Boolean) as Quest[];
    }
    return allQuests;
  };

  const filteredQuests = getFilteredQuests();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-sky-950/90 to-slate-950/95" />
      
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full mix-blend-screen blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full mix-blend-screen blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Quests</h1>
          <p className="text-slate-400 text-sm">
            Complete quests to earn XP and explore Poti
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-900/50 rounded-xl p-1 backdrop-blur-xl border border-sky-400/20">
          {[
            { id: "all", label: "All", count: allQuests.length },
            { id: "active", label: "Active", count: activeQuests.length },
            { id: "completed", label: "Completed", count: completedQuests.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 shadow-lg"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge
                    variant={activeTab === tab.id ? "default" : "info"}
                    className="text-xs"
                  >
                    {tab.count}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Quests List */}
        {questsLoading || userQuestsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredQuests.length === 0 ? (
          <Card variant="default" className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">
              {activeTab === "active"
                ? "No Active Quests"
                : activeTab === "completed"
                  ? "No Completed Quests"
                  : "No Quests Available"}
            </h3>
            <p className="text-slate-400 text-sm">
              {activeTab === "all"
                ? "Check back later for new quests!"
                : activeTab === "active"
                  ? "Start a quest to begin your adventure"
                  : "Complete quests to see them here"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredQuests.map((quest) => {
              const status = getQuestStatus(quest.id);
              const userQuest = [...activeQuests, ...completedQuests].find(
                (uq) => uq.quest_id === quest.id
              );

              return (
                <Card
                  key={quest.id}
                  variant="elevated"
                  className="p-5 hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white truncate">
                          {quest.name}
                        </h3>
                        {quest.is_daily && (
                          <Badge variant="warning" className="text-xs">
                            Daily
                          </Badge>
                        )}
                        {status === "active" && (
                          <Badge variant="info" className="text-xs">
                            Active
                          </Badge>
                        )}
                        {status === "completed" && (
                          <Badge variant="success" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  {/* Quest Info */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>+{quest.xp_reward} XP</span>
                    </div>
                    {quest.estimated_time && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-sky-400" />
                        <span>{quest.estimated_time} min</span>
                      </div>
                    )}
                    {quest.steps && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-purple-400" />
                        <span>{quest.steps.length} steps</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar (if active) */}
                  {status === "active" && userQuest && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>
                          Step {userQuest.current_step + 1} of{" "}
                          {quest.steps?.length || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all"
                          style={{
                            width: `${
                              ((userQuest.current_step + 1) /
                                (quest.steps?.length || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/quests/${quest.id}`} className="flex-1">
                      <Button variant="secondary" fullWidth size="sm">
                        View Details
                      </Button>
                    </Link>
                    {status === "available" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartQuest(quest.id)}
                        loading={startQuestMutation.isPending}
                        disabled={startQuestMutation.isPending}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {status === "active" && (
                      <Link href={`/quests/${quest.id}`} className="flex-1">
                        <Button variant="primary" fullWidth size="sm">
                          Continue
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


