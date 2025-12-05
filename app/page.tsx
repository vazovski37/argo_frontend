"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handlePrimaryClick = () => {
    router.push(isAuthenticated ? "/live" : "/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/image2.jpg"
          alt="Poti view"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-sky-950/85 to-slate-950/95" />
      </div>

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/25 rounded-full mix-blend-screen blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/25 rounded-full mix-blend-screen blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-blue-500/20 rounded-full mix-blend-screen blur-3xl" />
      </div>

      {/* Page content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navbar */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-slate-950/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/80 border border-sky-400/50 shadow-lg shadow-sky-900/60">
                <Image
                  src="/logo.png"
                  alt="Argonauts logo"
                  width={26}
                  height={26}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-semibold text-white tracking-tight">
                  Argonauts
                </span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Poti Guide
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-3 text-xs sm:text-sm">
              <Link
                href="#how-it-works"
                className="hidden text-slate-300 hover:text-sky-200 md:inline-block"
              >
                How it works
              </Link>
              <Link
                href="#features"
                className="hidden text-slate-300 hover:text-sky-200 md:inline-block"
              >
                Features
              </Link>
              <Link
                href={isAuthenticated ? "/live" : "/login"}
                className="rounded-xl border border-sky-400/60 bg-slate-900/70 px-3 py-1.5 text-sky-200 hover:bg-slate-900"
              >
                {isAuthenticated ? "Go to live guide" : "Log in"}
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1">
          <section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 md:flex-row md:items-center md:py-16">
            {/* Left: text */}
            <div className="w-full md:w-1/2">
              <div className="inline-flex items-center rounded-full border border-sky-500/40 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-sky-200 mb-4">
                <span className="mr-2 text-lg">⚓</span> Made for Poti explorers
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
                Your AI guide to{" "}
                <span className="text-sky-300">Poti&apos;s stories,</span>
                <br className="hidden sm:block" /> streets & sea.
              </h1>

              <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-300">
                Argonauts turns Poti into a game: chat with your AI guide, go on
                quests, check in at real locations, learn Georgian phrases and
                collect XP as you explore.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePrimaryClick}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-sky-900/60 hover:from-sky-400 hover:to-cyan-300"
                >
                  <span>Start live guide</span>
                  <span className="text-lg">🎙️</span>
                </button>

                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-600/80 bg-slate-950/70 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900/80"
                >
                  <span>See how it works</span>
                  <span className="text-base">↓</span>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-sky-300">●</span>
                  Live voice or chat
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300">●</span>
                  Location-based quests
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-300">●</span>
                  XP, levels & achievements
                </div>
              </div>
            </div>

            {/* Right: card panel / preview */}
            <div className="w-full md:w-1/2">
              <div className="relative mx-auto max-w-md rounded-3xl border border-sky-400/40 bg-slate-950/80 p-4 shadow-2xl shadow-sky-900/70">
                {/* Top bar */}
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-400/50">
                      <span className="text-lg">⚓</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-100">
                        Argonauts Live
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Your Poti AI guide
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] text-emerald-300">Ready</span>
                  </div>
                </div>

                {/* Fake conversation preview */}
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl bg-slate-900/80 px-3 py-2 text-slate-100">
                      <p>Welcome back! Where in Poti do you feel like exploring today?</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        20:14 · XP bonus available
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-2 text-slate-950">
                      <p>Show me a quest near the port 🌊</p>
                      <p className="mt-1 text-[11px] text-slate-800/80">
                        20:15 · You
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl bg-slate-900/80 px-3 py-2 text-slate-100">
                      <p>
                        I&apos;ve unlocked a quest starting at the lighthouse.
                        You&apos;ll learn a new Georgian phrase and earn 150 XP.
                      </p>
                      <p className="mt-1 text-[11px] text-sky-300">
                        ► Start &quot;Lights of Poti&quot; quest
                      </p>
                    </div>
                  </div>
                </div>

                {/* XP bar */}
                <div className="mt-4 rounded-2xl bg-slate-900/90 border border-slate-700 px-3 py-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Level 5 · Explorer</span>
                    <span>1,320 XP</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-800">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section
            id="how-it-works"
            className="mx-auto max-w-6xl px-4 py-8 sm:py-10"
          >
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
              How it works
            </h2>
            <p className="mt-2 text-center text-lg sm:text-2xl font-semibold text-white">
              Turn your walk through Poti into a playable story.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-sky-500/30 bg-slate-950/80 p-4">
                <p className="text-2xl mb-2">1️⃣</p>
                <h3 className="text-sm font-semibold text-white">
                  Start a live session
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Talk to Argonauts via voice or chat. Tell it where you are or
                  what mood you&apos;re in, and it will suggest things to do in
                  and around Poti.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/20 bg-slate-950/75 p-4">
                <p className="text-2xl mb-2">2️⃣</p>
                <h3 className="text-sm font-semibold text-white">
                  Explore & check in
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Visit locations, follow quests, learn local phrases, and take
                  photos. The system tracks your progress and unlocks
                  achievements.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/10 bg-slate-950/70 p-4">
                <p className="text-2xl mb-2">3️⃣</p>
                <h3 className="text-sm font-semibold text-white">
                  Level up your Poti story
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Earn XP, reach new ranks, and collect badges that reflect the
                  way you explore — from chill cafe-hopper to hardcore
                  adventurer.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            id="features"
            className="mx-auto max-w-6xl px-4 py-8 sm:py-10"
          >
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div>
                <h2 className="text-lg sm:text-2xl font-semibold text-white">
                  What you can do with Argonauts
                </h2>
                <p className="mt-1 text-sm text-slate-300 max-w-xl">
                  Designed around Poti, but flexible enough to grow with more
                  locations and stories in the future.
                </p>
              </div>
              <button
                onClick={handlePrimaryClick}
                className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-sky-400/70 bg-slate-950/80 px-4 py-2 text-sm text-sky-100 hover:bg-slate-900"
              >
                Jump into the live guide
                <span className="text-base">→</span>
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-sky-500/25 bg-slate-950/80 p-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="text-lg">🗺️</span> Map-aware suggestions
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Argonauts knows about curated locations in Poti. It can show
                  them on a map, guide you there, and avoid suggesting places
                  you&apos;ve already visited.
                </p>
              </div>

              <div className="rounded-2xl border border-sky-500/20 bg-slate-950/80 p-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="text-lg">📜</span> Story-driven quests
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Short narratives that connect landmarks, cafes, and hidden
                  corners into one coherent experience — like a mini RPG in the
                  city.
                </p>
              </div>

              <div className="rounded-2xl border border-sky-500/15 bg-slate-950/80 p-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="text-lg">🎖️</span> XP & achievements
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Each visit, photo, phrase and quest contributes to your level.
                  Unlock themed badges and secret achievements as you play.
                </p>
              </div>

              <div className="rounded-2xl border border-sky-500/10 bg-slate-950/80 p-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="text-lg">🗣️</span> Learn Georgian as you go
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300">
                  Ask your guide to teach you phrases relevant to where you are
                  — from ordering food to chatting with locals.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:flex-row">
            <p>
              © {new Date().getFullYear()} Argonauts. Built with love in Poti.
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="text-sky-300">●</span> Flask &amp; Next.js
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <span className="text-emerald-300">●</span> Gemini-powered guide
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
