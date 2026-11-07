import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

export function Logo({ size = "md", showTagline = false, className = "" }: LogoProps) {
  const iconSize = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";

  return (
    <Link href="/" className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Dynamic Animated Logo Mark */}
      <div className="relative">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 opacity-40 blur-sm group-hover:opacity-75 transition-opacity duration-500 animate-pulseGlow" />

        {/* Main Logo Container */}
        <div
          className={`relative ${iconSize} flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 border border-white/20`}
        >
          {/* Custom SVG Icon combining Shield and Precision Quill */}
          <svg
            className="w-3/5 h-3/5 drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Outer Verification Shield */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="opacity-90" />
            {/* Inner Precision Pen / Quill Line */}
            <path d="m14 8-4 4 1 3 3 1 4-4Z" fill="rgba(255,255,255,0.25)" />
            <path d="m9 15-2 2" stroke="white" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* Brand Name & Dynamic Pill */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`${textSize} font-black tracking-tight text-slate-900 group-hover:text-black transition-colors`}>
            Trust
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Write
            </span>
          </span>

          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
            <span>AI</span>
          </span>
        </div>

        {showTagline && (
          <span className="text-[11px] font-semibold text-slate-400 tracking-tight -mt-0.5">
            Writing Intelligence Workspace
          </span>
        )}
      </div>
    </Link>
  );
}
