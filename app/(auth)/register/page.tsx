"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Input, Card, LoadingSpinner } from "@/components/ui";

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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const {
    googleLogin,
    register,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/live");
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle Google credential response
  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      setIsLoading(true);
      setError("");

      const result = await googleLogin(response.credential);

      if (result.success) {
        router.push("/live");
      } else {
        setError(result.error || "Google sign up failed");
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
            text: "signup_with",
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

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const result = await register(email, password, name);

    if (result.success) {
      router.push("/live");
    } else {
      setError(result.error || "Registration failed");
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/potiView.png"
          alt="Poti seaside view"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-sky-950/80 to-slate-950/90" />
      </div>

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 w-72 h-72 bg-sky-500/25 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-24 w-72 h-72 bg-cyan-400/20 blur-3xl rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900/70 border border-sky-400/40 shadow-xl shadow-sky-900/50">
            <Image
              src="/logo.png"
              alt="Argonauts logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join Argonauts</h1>
          <p className="text-slate-400 text-sm">
            Create an account to start your journey in Poti
          </p>
        </div>

        {/* Card */}
        <Card variant="elevated" className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <>
              {/* Google Sign-Up */}
              {GOOGLE_CLIENT_ID ? (
                <div className="mb-4">
                  <div id="google-signin-button" className="w-full flex justify-center" />
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm text-center">
                  Google Sign-Up not configured
                </div>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sky-400/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="px-4 bg-slate-950/70 text-slate-400">
                    Or sign up with email
                  </span>
                </div>
              </div>

              {/* Email Register Button */}
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowEmailForm(true)}
                disabled={isLoading}
              >
                Continue with Email
              </Button>
            </>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoFocus
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                helperText="Must be at least 6 characters"
              />

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                error={
                  confirmPassword && password !== confirmPassword
                    ? "Passwords do not match"
                    : undefined
                }
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={isLoading || password !== confirmPassword}
              >
                Create Account
              </Button>

              <div className="flex items-center justify-between text-sm pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Back
                </button>
                <Link
                  href="/login"
                  className="text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Already have an account?
                </Link>
              </div>
            </form>
          )}

          {/* Terms */}
          <p className="mt-6 text-center text-slate-400 text-xs leading-relaxed">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
            >
              Privacy Policy
            </a>
          </p>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-slate-400 text-xs">
          Already have an account?{" "}
          <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

