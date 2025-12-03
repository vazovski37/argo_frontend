"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { LocationsResponse, Location } from "@/lib/schemas/locations";

async function fetchLocations(category?: string): Promise<LocationsResponse> {
  const url = category 
    ? `/api/locations?category=${encodeURIComponent(category)}`
    : "/api/locations";

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch locations");
  }

  return response.json();
}

async function fetchLocation(locationId: string): Promise<Location> {
  const response = await fetch(`/api/locations/${locationId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch location");
  }

  return response.json();
}

export function useLocations(category?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.locations.list(category),
    queryFn: () => fetchLocations(category),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - locations don't change often
  });
}

export function useLocation(locationId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.locations.detail(locationId),
    queryFn: () => fetchLocation(locationId),
    enabled: enabled && !!locationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

