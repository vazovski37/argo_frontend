"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuest, useUserQuests } from "@/hooks/queries/useQuests";
import { useStartQuest, useAdvanceQuest, useAbandonQuest } from "@/hooks/mutations/useQuestMutations";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Badge, LoadingSpinner } from "@/components/ui";
import { ArrowLeft, Trophy, Clock, Star, CheckCircle2, Play, X, MapPin } from "lucide-react";
import Link from "next/link";
import type { Quest, UserQuest } from "@/lib/schemas/quests";

export default function QuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const questId = params.questId as string;

  const { data: quest, isLoading: questLoading, error: questError } = useQuest(questId, isAuthenticated);
  const { data: userQuestsData } = useUserQuests(isAuthenticated);
  const startQuestMutation = useStartQuest();
  const advanceQuestMutation = useAdvanceQuest();
  const abandonQuestMutation = useAbandonQuest();

  const activeQuests = userQuestsData?.active || [];
  const completedQuests = userQuestsData?.completed || [];
  
  const userQuest = [...activeQuests, ...completedQuests].find(
    (uq) => uq.quest_id === questId
  );

  const status = userQuest
    ? userQuest.status
    : "available";

  const handleStartQuest = async () => {
    try {
      await startQuestMutation.mutateAsync(questId);
      // Refetch to update status
      router.refresh();
    } catch (error) {
      console.error("Failed to start quest:", error);
    }
  };

  const handleAdvanceQuest = async () => {
    if (!userQuest) return;
    try {
      await advanceQuestMutation.mutateAsync(questId);
      router.refresh();
    } catch (error) {
      console.error("Failed to advance quest:", error);
    }
  };

  const handleAbandonQuest = async () => {
    if (!userQuest || !confirm("Are you sure you want to abandon this quest?")) return;
    try {
      await abandonQuestMutation.mutateAsync(questId);
      router.push("/quests");
    } catch (error) {
      console.error("Failed to abandon quest:", error);
    }
  };

  if (questLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (questError || !quest) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load quest</p>
          <Button variant="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = userQuest
    ? quest.steps[userQuest.current_step]
    : null;
  const progress = userQuest
    ? ((userQuest.current_step + 1) / quest.steps.length) * 100
    : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-sky-950/90 to-slate-950/95" />
      
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full mix-blend-screen blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full mix-blend-screen blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-sky-400/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{quest.name}</h1>
            <p className="text-xs text-slate-400">Quest Details</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 pb-24">
        {/* Quest Info Card */}
        <Card variant="elevated" className="p-5 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-white">{quest.name}</h2>
                {quest.is_daily && (
                  <Badge variant="warning">Daily</Badge>
                )}
                {status === "active" && (
                  <Badge variant="info">Active</Badge>
                )}
                {status === "completed" && (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                {quest.description}
              </p>
            </div>
          </div>

          {/* Story Intro */}
          {quest.story_intro && (
            <div className="mb-4 p-4 rounded-xl bg-slate-900/50 border border-sky-400/20">
              <p className="text-slate-300 text-sm italic leading-relaxed">
                {quest.story_intro}
              </p>
            </div>
          )}

          {/* Quest Stats */}
          <div className="flex items-center gap-4 text-sm mb-4 pt-4 border-t border-sky-400/20">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-white font-medium">+{quest.xp_reward} XP</span>
            </div>
            {quest.estimated_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                <span className="text-slate-400">{quest.estimated_time} min</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">{quest.steps.length} steps</span>
            </div>
          </div>

          {/* Progress Bar (if active) */}
          {status === "active" && userQuest && (
            <div className="pt-4 border-t border-sky-400/20">
              <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                <span>Progress</span>
                <span>
                  Step {userQuest.current_step + 1} of {quest.steps.length}
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Steps */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-sky-400" />
            Quest Steps
          </h3>
          <div className="space-y-2">
            {quest.steps.map((step, index) => {
              const isCompleted = userQuest
                ? index < userQuest.current_step
                : false;
              const isCurrent = userQuest
                ? index === userQuest.current_step
                : false;
              const isLocked = userQuest
                ? index > userQuest.current_step
                : status === "available";

              return (
                <Card
                  key={index}
                  variant={isCurrent ? "bordered" : "default"}
                  className={`p-4 ${
                    isCurrent
                      ? "border-sky-400/60 bg-sky-500/10"
                      : isCompleted
                        ? "opacity-60"
                        : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-sky-500 text-white"
                            : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold mb-1 ${
                          isCurrent ? "text-sky-300" : "text-white"
                        }`}
                      >
                        {step.title}
                        {isCurrent && (
                          <Badge variant="info" className="ml-2 text-xs">
                            Current
                          </Badge>
                        )}
                      </h4>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                      {step.location_id && (
                        <Link
                          href={`/map?focus=${step.location_id}`}
                          className="inline-flex items-center gap-1.5 mt-2 text-sky-400 hover:text-sky-300 text-xs"
                        >
                          <MapPin className="w-3 h-3" />
                          View on Map
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {status === "available" && (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleStartQuest}
              loading={startQuestMutation.isPending}
              disabled={startQuestMutation.isPending}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quest
            </Button>
          )}

          {status === "active" && userQuest && (
            <>
              {currentStep && (
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleAdvanceQuest}
                  loading={advanceQuestMutation.isPending}
                  disabled={advanceQuestMutation.isPending}
                >
                  Complete Current Step
                </Button>
              )}
              <Button
                variant="danger"
                fullWidth
                onClick={handleAbandonQuest}
                loading={abandonQuestMutation.isPending}
                disabled={abandonQuestMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Abandon Quest
              </Button>
            </>
          )}

          {status === "completed" && (
            <Card variant="default" className="p-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-white font-medium mb-1">Quest Completed!</p>
              <p className="text-slate-400 text-sm">
                You earned {quest.xp_reward} XP
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


