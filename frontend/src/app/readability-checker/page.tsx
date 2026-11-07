import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { BarChart2, ArrowRight, CheckCircle, Calculator } from "lucide-react";

export const metadata = {
  title: "Multi-Formula Readability Analyzer | TrustWrite",
  description: "Calculate Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, and passive voice distribution in pure deterministic speed.",
};

export default function ReadabilityCheckerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Deterministic Text Metrics
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold text-slate-900">
              Multi-Formula Readability Suite
            </h1>
            <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Understand how accessible your writing is before publishing. Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog Index, passive voice detection, and transition word counts.
            </p>

            <div className="mt-8">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
              >
                <span>Launch Readability Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4">
          <AdBanner slotId="readability-checker-top" />
        </div>

        {/* Formulas Guide */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Deterministic Readability Formulas Explained
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Readability calculations at TrustWrite execute entirely deterministically in Python without relying on slow or non-deterministic external LLMs:
              </p>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Flesch Reading Ease (FRE)</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Scores from 0 to 100. Higher scores indicate easier readability (e.g. 60-70 corresponds to 8th/9th grade and is optimal for broad web audiences).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Flesch-Kincaid Grade Level</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Maps reading difficulty directly to the U.S. school grade level required for comprehension.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Gunning Fog Index</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Measures sentence length and percentage of complex words (3+ syllables) to estimate formal reading difficulty.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Passive Voice Detection</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Highlights passive grammatical constructions (e.g., "was completed by") so writers can convert them to dynamic active voice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
