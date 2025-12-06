"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const InteractiveMap = dynamic(
  () => import("@/components/features/map/InteractiveMap").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-800 animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    ),
  }
);

function MapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [photoFilter, setPhotoFilter] = useState<"all" | "private" | "group" | "public">("all");
  const focusedLocationId = searchParams.get("focus");

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/live"
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            title="Back to Live"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Quest Map</h1>
              <p className="text-xs text-slate-400">
                {focusedLocationId ? "Showing location" : "Explore Poti"}
              </p>
            </div>
          </div>
        </div>

        {/* Photo Filter Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Photos:</span>
          <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
            {(["all", "private", "group", "public"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPhotoFilter(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  photoFilter === filter
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                }`}
                title={
                  filter === "all"
                    ? "All photos"
                    : filter === "private"
                      ? "My photos only"
                      : filter === "group"
                        ? "Group photos"
                        : "Public photos"
                }
              >
                {filter === "all" && "🌍 All"}
                {filter === "private" && "🔒 Mine"}
                {filter === "group" && "👥 Groups"}
                {filter === "public" && "🌐 Public"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 overflow-hidden">
        <InteractiveMap focusedLocationId={focusedLocationId} photoFilter={photoFilter} />
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-white/10 bg-slate-900/80">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Tap markers for details • Use filters to see your photos</span>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading map...</span>
          </div>
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}

