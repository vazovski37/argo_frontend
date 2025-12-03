"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { VisitLocationResponse } from "@/lib/schemas/game";

interface VisitLocationInput {
  locationId?: string;
  locationName?: string;
}

async function visitLocation(input: VisitLocationInput): Promise<VisitLocationResponse> {
  const response = await fetch("/api/game/visit-location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location_id: input.locationId,
      location_name: input.locationName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to visit location");
  }

  return data;
}

export function useVisitLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: visitLocation,
    onSuccess: () => {
      // Invalidate game-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.game.progress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.game.visitedLocations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.game.achievements() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

