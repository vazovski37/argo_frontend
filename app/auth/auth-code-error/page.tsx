import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl max-w-md w-full text-center mx-6">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Authentication Error
        </h1>
        <p className="text-slate-400 mb-8">
          Something went wrong during the authentication process. Please try
          again.
        </p>

        <Link
          href="/login"
          className="inline-block w-full py-3 px-6 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-2xl transition-all duration-300"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

