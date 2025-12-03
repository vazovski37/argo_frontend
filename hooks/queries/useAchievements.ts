"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { AchievementsResponse } from "@/lib/schemas/game";

async function fetchAchievements(): Promise<AchievementsResponse> {
  const response = await fetch("/api/game/achievements");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch achievements");
  }

  return response.json();
}

export function useAchievements(enabled = true) {
  return useQuery({
    queryKey: queryKeys.game.achievements(),
    queryFn: fetchAchievements,
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

