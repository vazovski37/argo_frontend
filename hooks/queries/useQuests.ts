"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { QuestsResponse, Quest, UserQuestsResponse } from "@/lib/schemas/quests";

async function fetchQuests(includeDaily = true): Promise<QuestsResponse> {
  const url = `/api/quests?daily=${includeDaily}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch quests");
  }

  return response.json();
}

async function fetchQuest(questId: string): Promise<Quest> {
  const response = await fetch(`/api/quests/${questId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch quest");
  }

  return response.json();
}

async function fetchUserQuests(): Promise<UserQuestsResponse> {
  const response = await fetch("/api/quests/my-quests");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch user quests");
  }

  return response.json();
}

export function useQuests(includeDaily = true, enabled = true) {
  return useQuery({
    queryKey: queryKeys.quests.list(includeDaily),
    queryFn: () => fetchQuests(includeDaily),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useQuest(questId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.quests.detail(questId),
    queryFn: () => fetchQuest(questId),
    enabled: enabled && !!questId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserQuests(enabled = true) {
  return useQuery({
    queryKey: queryKeys.quests.userQuests(),
    queryFn: fetchUserQuests,
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

