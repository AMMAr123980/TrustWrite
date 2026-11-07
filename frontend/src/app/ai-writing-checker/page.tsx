import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { ShieldCheck, ArrowRight, AlertTriangle, CheckCircle, Info } from "lucide-react";

export const metadata = {
  title: "AI Writing Pattern Review & Ethical Disclosures | TrustWrite",
  description: "Uncertainty-aware writing signal review. Differentiating stylistic patterns from proof of authorship. Fair analysis for all writers.",
};

export default function AIWritingCheckerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Ethical Writing Intelligence
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold text-slate-900">
              AI Writing Pattern Review
            </h1>
            <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Analyze stylistic uniformity, sentence burstiness, and syntactic cadence with complete transparency. TrustWrite never treats statistical scores as proof of authorship or misconduct.
            </p>

            <div className="mt-8">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 transition-all"
              >
                <span>Launch AI Pattern Review</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4">
          <AdBanner slotId="ai-checker-top" />
        </div>

        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Stanford study callout */}
            <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-violet-900 font-bold text-lg">
                <ShieldCheck className="h-6 w-6 text-violet-600" />
                <span>The Stanford Study on AI Misclassification</span>
              </div>
              <p className="mt-3 text-sm text-violet-800 leading-relaxed">
                Researchers affiliated with Stanford University evaluated seven widely used AI-text detectors and discovered a profound bias: over 60% of TOEFL essays written by non-native English speakers were erroneously classified as AI-generated.
              </p>
              <p className="mt-2 text-sm text-violet-800 leading-relaxed">
                Because non-native writers naturally employ more uniform vocabulary and simpler syntax, standard perplexity models misinterpret their authentic work as machine-generated.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-white/80 border border-violet-200 text-xs text-violet-900 font-medium">
                TrustWrite's Ethical Position: We never claim an AI score establishes misconduct, cheating, or proof of authorship. We display uncertainty intervals and present findings solely as a prompt for peer review.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                What TrustWrite Evaluates
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><b>Sentence Burstiness:</b> Measures variance in sentence length. Natural human essays typically alternate between short, punchy statements and complex explanatory periods.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><b>Paragraph-Level Pacing:</b> Detects whether individual passages demonstrate unusual stylistic uniformity without making document-wide absolute generalizations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><b>Human Review Guidance:</b> Explains how writers can inject authentic personal voice, varied transitions, and original insights.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
