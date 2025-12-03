"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { PhotosResponse } from "@/lib/schemas/photos";

async function fetchPhotos(): Promise<PhotosResponse> {
  const response = await fetch("/api/photos");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch photos");
  }

  return response.json();
}

async function fetchLocationPhotos(locationId: string): Promise<PhotosResponse> {
  const response = await fetch(`/api/photos/location/${locationId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch location photos");
  }

  return response.json();
}

export function usePhotos(enabled = true) {
  return useQuery({
    queryKey: queryKeys.photos.list(),
    queryFn: fetchPhotos,
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useLocationPhotos(locationId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.photos.byLocation(locationId),
    queryFn: () => fetchLocationPhotos(locationId),
    enabled: enabled && !!locationId,
    staleTime: 60 * 1000, // 1 minute
  });
}

