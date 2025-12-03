"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { LearnPhraseResponse } from "@/lib/schemas/game";

interface LearnPhraseInput {
  phrase: string;
  meaning?: string;
}

async function learnPhrase(input: LearnPhraseInput): Promise<LearnPhraseResponse> {
  const response = await fetch("/api/game/learn-phrase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to learn phrase");
  }

  return data;
}

export function useLearnPhrase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: learnPhrase,
    onSuccess: () => {
      // Invalidate game-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.game.progress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.game.achievements() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

