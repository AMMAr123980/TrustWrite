import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, ArrowRight, BookOpen, Layers, CheckCircle } from "lucide-react";

export const metadata = {
  title: "How It Works & Ethics Framework | TrustWrite",
  description: "Learn how TrustWrite combines deterministic algorithms, grammar heuristics, and ethical uncertainty-aware AI signals.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Methodology & Ethics
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold text-slate-900">
              How TrustWrite Works
            </h1>
            <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We believe in algorithmic transparency, explainability, and protecting authentic human writers. Here is the science and philosophy behind our platform.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                1. Three-Tier Cost & Speed Architecture
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Rather than sending every keystroke to expensive external LLMs, TrustWrite utilizes a tiered approach:
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>
                  <b>Tier 1: Deterministic Engine</b> &mdash; Word count, sentence statistics, Flesch Reading Ease, Gunning Fog, and DOI formats are evaluated with pure Python math in milliseconds.
                </li>
                <li>
                  <b>Tier 2: Linguistic Grammar Rules</b> &mdash; Normalized subject-verb agreement, homophone disambiguation, and punctuation rules execute locally with full linguistic context.
                </li>
                <li>
                  <b>Tier 3: On-Demand AI Assistance</b> &mdash; Rephrasing, tone shifts, and complex summaries are triggered only on explicit user request.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-lg">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                <span>2. The Non-Accusatory Verification Framework</span>
              </div>
              <p className="mt-3 text-sm text-blue-800 leading-relaxed">
                TrustWrite is explicitly not built to serve as an automated disciplinary tool. Academic research has repeatedly proved that machine learning detectors exhibit substantial false positive rates, especially against international students and multilingual scholars.
              </p>
              <p className="mt-2 text-sm text-blue-800 leading-relaxed">
                When TrustWrite identifies low sentence-length variance or uniform token transitions, we label this as a <b>"Writing Pattern Indicator"</b> and urge manual peer review, rather than issuing definitive accusations.
              </p>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                <span>Try the Workspace for Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
