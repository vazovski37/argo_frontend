import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-white overflow-hidden">
      {/* Background gradient and glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900" />

        {/* Soft ocean glows */}
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-sky-500/25 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-cyan-400/25 rounded-full blur-[160px]" />

        {/* Wave shape at bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full opacity-[0.15]"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#38bdf8"
            d="M0,64L80,96C160,128,320,192,480,192C640,192,800,128,960,112C1120,96,1280,128,1360,144L1440,160V0H0Z"
          />
        </svg>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-8 px-4">
        {/* Giant 404 row */}
        <div className="flex items-end justify-center gap-8 sm:gap-12 select-none">
          <span className="text-[170px] sm:text-[220px] lg:text-[260px] font-black leading-none tracking-tight drop-shadow-[0_0_45px_rgba(56,189,248,0.45)]">
            4
          </span>

          <div className="relative flex items-center justify-center">
            {/* Glow behind wheel */}
            <div className="absolute inset-0 rounded-full bg-sky-400/40 blur-3xl opacity-80" />
            <Image
              src="/steering-wheel.png"
              alt="Steering wheel"
              width={260}
              height={260}
              priority
              className="w-[150px] sm:w-[190px] lg:w-[230px] drop-shadow-[0_0_25px_rgba(8,47,73,0.9)]"
            />
          </div>

          <span className="text-[170px] sm:text-[220px] lg:text-[260px] font-black leading-none tracking-tight drop-shadow-[0_0_45px_rgba(56,189,248,0.45)]">
            4
          </span>
        </div>

        {/* Single CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 px-10 py-3 text-lg font-semibold text-slate-900 shadow-[0_10px_30px_rgba(56,189,248,0.35)] hover:scale-105 transition-transform"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
