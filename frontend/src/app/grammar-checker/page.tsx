import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, BookOpen } from "lucide-react";

export const metadata = {
  title: "Online Grammar & Spell Checker | TrustWrite",
  description: "Check grammar, spelling, punctuation, and word choice errors with instant explanations. 100% free with TrustWrite Writing Intelligence.",
};

export default function GrammarCheckerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Free Writing Utility
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold text-slate-900">
              Online Grammar & Spell Checker
            </h1>
            <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Detect subject-verb agreement slips, confused homophones, unnecessary wordiness, and punctuation errors. Every suggestion includes a clear explanation.
            </p>

            <div className="mt-8">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                <span>Launch Grammar Checker Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4">
          <AdBanner slotId="grammar-checker-top" />
        </div>

        {/* Educational Content Section */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">
                How TrustWrite Checks Your Grammar Differently
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Most basic spellcheckers simply replace words without providing linguistic context. TrustWrite normalizes all grammar, spelling, punctuation, and clarity rules into a standardized diagnostic format.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-blue-600">Subject-Verb Agreement</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Fixes discrepancies between third-person singular subjects and plural auxiliary verbs (e.g., "He don't" &rarr; "He doesn't").
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-blue-600">Confused Homophones</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Identifies context-sensitive mixups including "their / there / they're", "its / it's", and "then / than".
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-blue-600">Punctuation & Spacing</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Detects stray spaces before punctuation marks and ensures consistent typographic spacing.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-blue-600">Wordiness & Redundancy</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Highlights verbose bureaucratic clichés like "due to the fact that" and offers direct replacements ("because").
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="text-xl font-bold text-slate-900">
                Accept, Reject, or Undo with Total Control
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                TrustWrite never automatically alters your text. You can inspect each correction individually, read why the change is recommended, and apply edits with a single click.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
