"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

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
  
  const { googleLogin, login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle Google credential response
  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setIsLoading(true);
    setError("");
    
    const result = await googleLogin(response.credential);
    
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Google login failed");
      setIsLoading(false);
    }
  }, [googleLogin, router]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-purple-500/30 mb-6">
            <span className="text-3xl">⚓</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome to Argonauts
          </h1>
          <p className="mt-3 text-slate-400 text-sm">
            {isRegister ? "Create an account to start your journey" : "Sign in to continue your journey"}
          </p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <>
              {/* Google Sign-In Button */}
              {GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center mb-4">
                  <div id="google-signin-button" className="w-full"></div>
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm text-center">
                  Google Sign-In not configured
                </div>
              )}

              {/* Or Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-slate-500 text-xs uppercase tracking-wider">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Login Button */}
              <button
                onClick={() => setShowEmailForm(true)}
                disabled={isLoading}
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/20 disabled:opacity-50"
              >
                Sign in with Email
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Your name"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-2xl transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isRegister ? "Creating account..." : "Signing in..."}
                  </span>
                ) : (
                  isRegister ? "Create Account" : "Sign In"
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {isRegister ? "Already have an account?" : "Need an account?"}
                </button>
              </div>
            </form>
          )}

          {/* Info */}
          <p className="mt-6 text-center text-slate-500 text-xs leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-slate-600 text-xs">
          Powered by Flask & Next.js
        </p>
      </div>
    </div>
  );
}
