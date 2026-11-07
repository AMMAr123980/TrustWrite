"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/app", label: "Workspace" },
    { href: "/grammar-checker", label: "Grammar" },
    { href: "/readability-checker", label: "Readability" },
    { href: "/ai-writing-checker", label: "AI Signals" },
    { href: "/citation-checker", label: "Citations" },
    { href: "/writing-assistant", label: "Assistant" },
    { href: "/how-it-works", label: "How It Works" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Logo size="md" />

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Launch App</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2 text-sm font-semibold text-slate-700 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              <span>{link.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
