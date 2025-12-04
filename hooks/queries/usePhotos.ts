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

async function fetchPhotoFeed(filter: string = "all", groupId?: string): Promise<PhotosResponse> {
  const params = new URLSearchParams({ filter });
  if (groupId) {
    params.append("group_id", groupId);
  }

  const response = await fetch(`/api/photos/feed?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch photo feed");
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

export function usePhotoFeed(filter: string = "all", groupId?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.photos.feed(filter, groupId),
    queryFn: () => fetchPhotoFeed(filter, groupId),
    enabled,
    staleTime: 30 * 1000, // 30 seconds (feed updates more frequently)
  });
}

