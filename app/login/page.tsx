"use client";

import type React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const {
    googleLogin,
    login,
    register,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle Google credential response
  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      setIsLoading(true);
      setError("");

      const result = await googleLogin(response.credential);

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Google login failed");
        setIsLoading(false);
      }
    },
    [googleLogin, router]
  );

  // Initialize Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("Google Client ID not configured");
      return;
    }

    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        const buttonContainer = document.getElementById("google-signin-button");
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: "filled_blue",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 320,
          });
        }
      }
    };

    // Load Google Sign-In script
    if (!document.getElementById("google-signin-script")) {
      const script = document.createElement("script");
      script.id = "google-signin-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, [handleGoogleResponse]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = isRegister
      ? await register(email, password, name)
      : await login(email, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Authentication failed");
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background image of Poti */}
      <div className="absolute inset-0">
        <Image
          src="/potiView.png"
          alt="Poti seaside view"
          fill
          priority
          className="object-cover"
        />
        {/* Blue sea overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-sky-950/80 to-slate-950/90" />
      </div>

      {/* Subtle light beams / overlay accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 w-72 h-72 bg-sky-500/25 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-24 w-72 h-72 bg-cyan-400/20 blur-3xl rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/15 blur-3xl rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 py-10">
        {/* Logo / brand */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900/70 border border-sky-500/30 shadow-xl shadow-sky-900/50">
            <Image
              src="/logo.png"
              alt="Argonauts logo"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Welcome to Argonauts
          </h1>
          <p className="mt-3 text-slate-300 text-sm">
            {isRegister
              ? "Create an account to start your journey in Poti."
              : "Sign in to continue exploring Poti and beyond."}
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-2xl bg-slate-950/70 border border-sky-500/20 rounded-3xl p-8 shadow-2xl shadow-slate-950/80">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <>
              {/* Google Sign-In Button */}
              {GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center mb-4">
                  <div id="google-signin-button" className="w-full" />
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm text-center">
                  Google Sign-In not configured
                </div>
              )}

              {/* Or Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
                  <span className="px-4 bg-slate-950/70 text-slate-400">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Login Button */}
              <button
                onClick={() => setShowEmailForm(true)}
                disabled={isLoading}
                className="w-full py-3 px-6 bg-sky-500/80 hover:bg-sky-400 text-slate-950 font-medium rounded-2xl transition-all duration-300 border border-sky-300/70 disabled:opacity-60"
              >
                Continue with Email
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-semibold rounded-2xl transition-all duration-300 disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
                    {isRegister ? "Creating account..." : "Signing in..."}
                  </span>
                ) : isRegister ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-sky-300 hover:text-sky-200 transition-colors"
                >
                  {isRegister
                    ? "Already have an account?"
                    : "Need an account?"}
                </button>
              </div>
            </form>
          )}

          {/* Info */}
          <p className="mt-6 text-center text-slate-400 text-xs leading-relaxed">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-slate-400 text-xs">
          Powered by Flask &amp; Next.js • Made in Poti
        </p>
      </div>
    </div>
  );
}
