"use client";

import { UserGameState, getRankForXp, getXpToNextRank, ranks } from "@/prompts";

interface GameProgressBarProps {
  gameState: UserGameState | null;
  compact?: boolean;
  className?: string;
}

export function GameProgressBar({ gameState, compact = false, className = "" }: GameProgressBarProps) {
  if (!gameState) {
    return (
      <div className={`animate-pulse bg-white/5 rounded-xl p-3 ${className}`}>
        <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
        <div className="h-2 bg-white/10 rounded w-full"></div>
      </div>
    );
  }

  const currentRank = getRankForXp(gameState.totalXp);
  const xpToNext = getXpToNextRank(gameState.totalXp);
  const nextRank = ranks.find(r => r.level === currentRank.level + 1);
  
  // Calculate progress percentage
  const xpInCurrentLevel = gameState.totalXp - currentRank.minXp;
  const xpNeededForLevel = nextRank ? (nextRank.minXp - currentRank.minXp) : 1;
  const progressPercent = nextRank ? Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100) : 100;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="text-xl">{currentRank.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white font-medium truncate">{currentRank.name}</span>
            <span className="text-purple-400">{gameState.totalXp} XP</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentRank.icon}</span>
          <div>
            <h3 className="text-white font-semibold">{currentRank.name}</h3>
            <p className="text-xs text-slate-400">Level {currentRank.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            {gameState.totalXp} XP
          </p>
          {xpToNext && (
            <p className="text-xs text-slate-500">{xpToNext} to next level</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        <StatItem icon="🗺️" value={gameState.locationsVisited} label="Visited" />
        <StatItem icon="📸" value={gameState.photosTaken} label="Photos" />
        <StatItem icon="🏆" value={gameState.achievementsEarned} label="Badges" />
        <StatItem icon="📜" value={gameState.questsCompleted} label="Quests" />
      </div>

      {/* Active quests */}
      {gameState.activeQuests.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-slate-500 mb-1">Active Quest:</p>
          <p className="text-sm text-white truncate">{gameState.activeQuests[0]}</p>
        </div>
      )}
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="text-center">
      <span className="text-lg">{icon}</span>
      <p className="text-white font-semibold text-sm">{value}</p>
      <p className="text-slate-500 text-xs">{label}</p>
    </div>
  );
}

export default GameProgressBar;






