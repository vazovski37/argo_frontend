"use client";

import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    const variantClasses = {
      default: "backdrop-blur-xl bg-slate-950/70 border border-sky-400/40 rounded-2xl",
      bordered: "backdrop-blur-xl bg-slate-950/70 border-2 border-sky-400/40 rounded-2xl",
      elevated: "backdrop-blur-xl bg-slate-950/70 border border-sky-400/40 rounded-2xl shadow-lg shadow-sky-900/20",
    };

    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

