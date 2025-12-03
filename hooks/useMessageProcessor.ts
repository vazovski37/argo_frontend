"use client";

import { useCallback, useRef } from "react";
import { Location, Achievement } from "./useGameProgress";

interface MessageProcessorOptions {
  locations: Location[];
  visitedLocationIds: string[];
  phrasesLearned: string[];
  onVisitLocation: (locationId: string) => Promise<{ xpEarned: number; newAchievements: string[] }>;
  onLearnPhrase: (phrase: string) => Promise<void>;
  onAchievementEarned?: (achievement: Achievement) => void;
  achievements: Achievement[];
}

// Keywords that indicate a visit
const VISIT_KEYWORDS = [
  "visited", "went to", "been to", "at the", "arrived at", "checking in",
  "i'm at", "im at", "i am at", "just arrived", "here at", "standing at",
  "reached", "found", "discovered", "explored", "saw the", "seeing the",
  "looking at", "in front of", "near the", "walked to", "came to",
  "stopped by", "checked out", "touring", "at", "visiting"
];

// Keywords that indicate learning a phrase
const PHRASE_KEYWORDS = [
  "learned", "know how to say", "can say", "taught me", "means",
  "how do you say", "in georgian", "gamarjoba", "madloba", "gaumarjos",
  "diakh", "ara", "kargi", "bodishi", "nakhvamdis", "gmadlobt", "ramdenia"
];

// Georgian phrases to detect
const GEORGIAN_PHRASES_MAP: Record<string, string> = {
  "gamarjoba": "გამარჯობა",
  "madloba": "მადლობა",
  "diakh": "დიახ",
  "ara": "არა",
  "gaumarjos": "გაუმარჯოს",
  "ramdenia": "რამდენია?",
  "gmadlobt": "გმადლობთ",
  "kargi": "კარგი",
  "nakhvamdis": "ნახვამდის",
  "bodishi": "ბოდიში",
};

export function useMessageProcessor(options: MessageProcessorOptions) {
  const {
    locations,
    visitedLocationIds,
    phrasesLearned,
    onVisitLocation,
    onLearnPhrase,
    onAchievementEarned,
    achievements,
  } = options;

  const processingRef = useRef<Set<string>>(new Set());

  // Find location by name (fuzzy match)
  const findLocation = useCallback((text: string): Location | null => {
    const lowerText = text.toLowerCase();
    
    // Try exact match first
    for (const location of locations) {
      if (lowerText.includes(location.name.toLowerCase())) {
        return location;
      }
    }

    // Try partial match
    for (const location of locations) {
      const words = location.name.toLowerCase().split(" ");
      if (words.some(word => word.length > 3 && lowerText.includes(word))) {
        return location;
      }
    }

    // Common aliases
    const aliases: Record<string, string[]> = {
      "lighthouse": ["poti lighthouse", "შუქურა"],
      "argonauts": ["argonauts monument", "არგონავტების"],
      "cathedral": ["poti cathedral", "საკათედრო"],
      "port": ["poti port", "პორტი"],
      "lake": ["paliastomi lake", "პალიასტომის"],
      "kolkheti": ["kolkheti national park", "restaurant kolkheti"],
      "beach": ["black sea beach"],
      "river": ["rioni river", "rioni"],
      "phazisi": ["cafe phazisi"],
      "fish market": ["local fish market"],
    };

    for (const [alias, possibleMatches] of Object.entries(aliases)) {
      if (lowerText.includes(alias)) {
        for (const match of possibleMatches) {
          const location = locations.find(l => l.name.toLowerCase().includes(match.toLowerCase()));
          if (location) return location;
        }
      }
    }

    return null;
  }, [locations]);

  // Check if text indicates a visit
  const detectVisit = useCallback((text: string): Location | null => {
    const lowerText = text.toLowerCase();
    
    // Check if any visit keyword is present
    const hasVisitKeyword = VISIT_KEYWORDS.some(keyword => lowerText.includes(keyword));
    if (!hasVisitKeyword) return null;

    return findLocation(text);
  }, [findLocation]);

  // Detect Georgian phrases
  const detectPhrase = useCallback((text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    // Check for phrase keywords
    const hasPhraseKeyword = PHRASE_KEYWORDS.some(keyword => lowerText.includes(keyword));
    if (!hasPhraseKeyword) return null;

    // Find which phrase was mentioned
    for (const [transliteration, georgian] of Object.entries(GEORGIAN_PHRASES_MAP)) {
      if (lowerText.includes(transliteration) || lowerText.includes(georgian)) {
        return georgian;
      }
    }

    return null;
  }, []);

  // Process a message (from user or AI)
  const processMessage = useCallback(async (text: string, role: "user" | "assistant"): Promise<{
    visitedLocation?: Location;
    learnedPhrase?: string;
    xpEarned: number;
    newAchievements: string[];
  }> => {
    const result = {
      xpEarned: 0,
      newAchievements: [] as string[],
    };

    // Process user messages for visits
    if (role === "user") {
      const location = detectVisit(text);
      if (location && !visitedLocationIds.includes(location.id)) {
        // Prevent duplicate processing
        if (processingRef.current.has(location.id)) {
          return result;
        }
        processingRef.current.add(location.id);

        try {
          console.log("[GAME] 📍 Detected visit to:", location.name);
          const visitResult = await onVisitLocation(location.id);
          result.visitedLocation = location;
          result.xpEarned += visitResult.xpEarned;
          result.newAchievements.push(...visitResult.newAchievements);

          // Trigger achievement notification
          if (visitResult.newAchievements.length > 0 && onAchievementEarned) {
            visitResult.newAchievements.forEach(name => {
              const achievement = achievements.find(a => a.name === name);
              if (achievement) onAchievementEarned(achievement);
            });
          }
        } finally {
          processingRef.current.delete(location.id);
        }
      }
    }

    // Process both user and AI messages for phrase learning
    const phrase = detectPhrase(text);
    if (phrase && !phrasesLearned.includes(phrase)) {
      if (!processingRef.current.has(phrase)) {
        processingRef.current.add(phrase);
        try {
          console.log("[GAME] 🗣️ Detected phrase learning:", phrase);
          await onLearnPhrase(phrase);
          result.learnedPhrase = phrase;
          result.xpEarned += 15;
        } finally {
          processingRef.current.delete(phrase);
        }
      }
    }

    return result;
  }, [
    detectVisit,
    detectPhrase,
    visitedLocationIds,
    phrasesLearned,
    onVisitLocation,
    onLearnPhrase,
    onAchievementEarned,
    achievements,
  ]);

  return {
    processMessage,
    detectVisit,
    detectPhrase,
    findLocation,
  };
}

export default useMessageProcessor;




