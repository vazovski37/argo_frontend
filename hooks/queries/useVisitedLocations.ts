"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { VisitedLocationsResponse } from "@/lib/schemas/game";

async function fetchVisitedLocations(): Promise<VisitedLocationsResponse> {
  const response = await fetch("/api/game/visited-locations");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch visited locations");
  }

  return response.json();
}

export function useVisitedLocations(enabled = true) {
  return useQuery({
    queryKey: queryKeys.game.visitedLocations(),
    queryFn: fetchVisitedLocations,
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

