"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { User, UserProgress } from "@/lib/schemas/auth";

interface CurrentUserResponse {
  user: User;
  progress: UserProgress | null;
}

async function fetchCurrentUser(): Promise<CurrentUserResponse | null> {
  const response = await fetch("/api/auth/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401
  });
}

export function useInvalidateAuth() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
  };
}

