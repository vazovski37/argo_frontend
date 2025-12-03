"use client";

import { useEffect, useState } from "react";

interface AchievementToastProps {
  name: string;
  icon: string;
  xp: number;
  isSecret?: boolean;
  onClose: () => void;
}

export function AchievementToast({ name, icon, xp, isSecret = false, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-r from-violet-900/90 to-fuchsia-900/90 border border-white/20 shadow-2xl shadow-purple-500/20 p-4 min-w-[280px]">
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#a855f7', '#ec4899', '#06b6d4', '#fbbf24'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 animate-bounce-slow">
            {icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-purple-300 font-medium uppercase tracking-wider">
              {isSecret ? '🔮 Secret Achievement!' : '🎉 Achievement Unlocked!'}
            </p>
            <h3 className="text-white font-bold text-lg truncate">{name}</h3>
            <p className="text-amber-400 text-sm font-medium">+{xp} XP</p>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsLeaving(true);
              setTimeout(onClose, 300);
            }}
            className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-shrink-bar"
            style={{ animationDuration: '4s' }}
          />
        </div>
      </div>
    </div>
  );
}

// Add these to your global CSS or tailwind config
// @keyframes confetti {
//   0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
//   100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
// }
// @keyframes shrink-bar {
//   from { width: 100%; }
//   to { width: 0%; }
// }
// @keyframes bounce-slow {
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-5px); }
// }

export default AchievementToast;





