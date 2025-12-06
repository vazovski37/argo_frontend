"use client";

import { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-slate-800/80 text-slate-300 border border-white/10",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    info: "bg-sky-500/20 text-sky-400 border border-sky-400/30",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

