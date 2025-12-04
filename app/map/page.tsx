"use client";

import { Suspense } from "react";
import { Map, Navigation, Trophy, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useGameProgress } from "@/hooks/queries/useGameProgress";
import { GameProgressBar } from "@/components/GameProgressBar";
import { getRankForXp } from "@/prompts/gamification/ranks";

// Dynamic import to avoid SSR issues with Google Maps
const InteractiveMap = dynamic(
  () => import("@/components/InteractiveMap").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[80vh] w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    ),
  }
);

// Build game state for progress bar
function buildGameState(progress: any) {
  if (!progress) return null;
  
  return {
    totalXp: progress.total_xp || 0,
    currentLevel: progress.level || 1,
    currentRank: getRankForXp(progress.total_xp || 0).name,
    locationsVisited: progress.locations_visited || 0,
    photosTaken: progress.photos_taken || 0,
    questsCompleted: progress.quests_completed || 0,
    achievementsEarned: progress.achievements_earned || 0,
    phrasesLearned: progress.learned_phrases || [],
    activeQuests: [],
    completedAchievements: [],
  };
}

export default function MapPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: progressData } = useGameProgress();

  const gameState = buildGameState(progressData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Quest Map</h1>
                  <p className="text-xs text-slate-400">Explore Poti</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <Link
                href="/live"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">AI Guide</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Bar */}
        {gameState && (
          <div className="mb-6">
            <GameProgressBar gameState={gameState} compact className="max-w-md" />
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span className="text-slate-300">Landmarks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-slate-300">Restaurants</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-violet-500 rounded-full" />
            <span className="text-slate-300">Museums</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-slate-300">Nature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full" />
            <span className="text-slate-300">Beaches</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-slate-300">Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white" />
            <span className="text-slate-300">You</span>
          </div>
        </div>

        {/* Map */}
        <Suspense
          fallback={
            <div className="h-[80vh] w-full bg-slate-800 rounded-xl animate-pulse flex items-center justify-center">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading map...</span>
              </div>
            </div>
          }
        >
          <InteractiveMap />
        </Suspense>

        {/* Instructions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-semibold text-white">Find Locations</h3>
            </div>
            <p className="text-sm text-slate-400">
              Tap any marker to see details about the location and earn XP.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Navigation className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Get Directions</h3>
            </div>
            <p className="text-sm text-slate-400">
              Click &quot;Directions&quot; to see the driving route from your location.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">Check In</h3>
            </div>
            <p className="text-sm text-slate-400">
              Get within 100m of a location and tap &quot;Check In&quot; to earn XP!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>🏛️ Argonauts - Your AI Guide to Poti, Georgia</p>
        </div>
      </footer>
    </div>
  );
}

