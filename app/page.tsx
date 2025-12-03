"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";

export default function Home() {
  const { user, progress, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* User Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl max-w-lg w-full text-center">
          {/* Avatar */}
          <div className="mb-6">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto ring-4 ring-purple-500/30 shadow-lg shadow-purple-500/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Welcome Text */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-slate-400 mb-2">
            {user.name || "Traveler"}
          </p>
          <p className="text-slate-500 text-sm mb-4">{user.email}</p>

          {/* Progress Summary */}
          {progress && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{progress.current_level}</p>
                  <p className="text-slate-500">Level</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{progress.total_xp}</p>
                  <p className="text-slate-500">XP</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-fuchsia-400">{progress.locations_visited}</p>
                  <p className="text-slate-500">Places</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">{progress.achievements_earned}</p>
                  <p className="text-slate-500">Achievements</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white font-medium">{progress.current_rank}</p>
                <p className="text-slate-500 text-xs">Current Rank</p>
              </div>
            </div>
          )}

          {/* Live Chat Button */}
          <Link
            href="/live"
            className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 mb-3"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Start Live Chat with Gemini
          </Link>

          {/* Sign Out Button */}
          <SignOutButton />
        </div>

        {/* Footer */}
        <p className="mt-8 text-slate-600 text-xs">
          Powered by Flask & Next.js
        </p>
      </div>
    </div>
  );
}
