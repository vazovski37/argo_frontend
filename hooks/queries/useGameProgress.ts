"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { GameState } from "@/lib/schemas/game";

async function fetchProgress(): Promise<GameState> {
  const response = await fetch("/api/game/progress");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch progress");
  }

  return response.json();
}

export function useGameProgress(enabled = true) {
  return useQuery({
    queryKey: queryKeys.game.progress(),
    queryFn: fetchProgress,
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

