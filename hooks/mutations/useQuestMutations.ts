"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { StartQuestResponse, AdvanceQuestResponse, AbandonQuestResponse } from "@/lib/schemas/quests";

async function startQuest(questId: string): Promise<StartQuestResponse> {
  const response = await fetch(`/api/quests/${questId}/start`, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to start quest");
  }

  return data;
}

async function advanceQuest(questId: string): Promise<AdvanceQuestResponse> {
  const response = await fetch(`/api/quests/${questId}/advance`, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to advance quest");
  }

  return data;
}

async function abandonQuest(questId: string): Promise<AbandonQuestResponse> {
  const response = await fetch(`/api/quests/${questId}/abandon`, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to abandon quest");
  }

  return data;
}

export function useStartQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quests.userQuests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.game.progress() });
    },
  });
}

export function useAdvanceQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: advanceQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quests.userQuests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.game.progress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.game.achievements() });
    },
  });
}

export function useAbandonQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: abandonQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quests.userQuests() });
    },
  });
}

