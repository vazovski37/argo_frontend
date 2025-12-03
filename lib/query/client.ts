"use client";

import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we don't want to refetch immediately on mount
        staleTime: 60 * 1000, // 1 minute
        // Retry failed requests
        retry: 1,
        // Refetch on window focus (good for keeping data fresh)
        refetchOnWindowFocus: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

// Query keys for cache management
export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  // Game
  game: {
    all: ["game"] as const,
    progress: () => [...queryKeys.game.all, "progress"] as const,
    achievements: () => [...queryKeys.game.all, "achievements"] as const,
    visitedLocations: () => [...queryKeys.game.all, "visited-locations"] as const,
    stats: () => [...queryKeys.game.all, "stats"] as const,
    leaderboard: (limit?: number) => [...queryKeys.game.all, "leaderboard", limit] as const,
  },
  // Locations
  locations: {
    all: ["locations"] as const,
    list: (category?: string) => [...queryKeys.locations.all, "list", category] as const,
    detail: (id: string) => [...queryKeys.locations.all, "detail", id] as const,
    nearby: (lat: number, lng: number, radius?: number) => 
      [...queryKeys.locations.all, "nearby", lat, lng, radius] as const,
    categories: () => [...queryKeys.locations.all, "categories"] as const,
  },
  // Quests
  quests: {
    all: ["quests"] as const,
    list: (includeDaily?: boolean) => [...queryKeys.quests.all, "list", includeDaily] as const,
    detail: (id: string) => [...queryKeys.quests.all, "detail", id] as const,
    userQuests: () => [...queryKeys.quests.all, "user-quests"] as const,
  },
  // Photos
  photos: {
    all: ["photos"] as const,
    list: () => [...queryKeys.photos.all, "list"] as const,
    byLocation: (locationId: string) => [...queryKeys.photos.all, "location", locationId] as const,
  },
};

