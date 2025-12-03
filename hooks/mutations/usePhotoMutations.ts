"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { UploadPhotoResponse, DeletePhotoResponse } from "@/lib/schemas/photos";

interface UploadPhotoInput {
  file: File;
  locationId?: string;
  caption?: string;
  isSelfie?: boolean;
}

async function uploadPhoto(input: UploadPhotoInput): Promise<UploadPhotoResponse> {
  const formData = new FormData();
  formData.append("file", input.file);
  if (input.locationId) formData.append("location_id", input.locationId);
  if (input.caption) formData.append("caption", input.caption);
  if (input.isSelfie !== undefined) formData.append("is_selfie", String(input.isSelfie));

  const response = await fetch("/api/photos/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload photo");
  }

  return data;
}

async function deletePhoto(photoId: string): Promise<DeletePhotoResponse> {
  const response = await fetch(`/api/photos/${photoId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete photo");
  }

  return data;
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.game.progress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.game.achievements() });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.game.progress() });
    },
  });
}

