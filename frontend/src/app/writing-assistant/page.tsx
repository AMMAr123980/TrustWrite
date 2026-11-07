import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { Wand2, ArrowRight, CheckCircle } from "lucide-react";

export const metadata = {
  title: "AI Writing Assistant & Rewriter | TrustWrite",
  description: "Improve professional tone, make text concise, and simplify complex phrasing with transparent before/after diffs.",
};

export default function WritingAssistantPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Style & Tone Assistant
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold text-slate-900">
              AI Writing Assistant & Rewriter
            </h1>
            <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Transform awkward phrasing into authoritative business communication, trim verbose filler into crisp prose, and summarize long texts with clear revision explanations.
            </p>

            <div className="mt-8">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
              >
                <span>Open Writing Assistant</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4">
          <AdBanner slotId="assistant-top" />
        </div>

        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Action-Oriented Writing Modes
              </h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-indigo-600">👔 Make Professional</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Elevates conversational vocabulary into authoritative, corporate and executive-ready prose while removing colloquialisms.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-indigo-600">✂️ Make Concise</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Strips redundant phrases like "due to the fact that" and "in order to", saving reader attention without losing core facts.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-indigo-600">💡 Simplify Language</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Replaces bureaucratic jargon with clear, direct plain-English phrasing accessible to all audiences.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-indigo-600">📌 Summarize Key Points</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Distills multi-paragraph documents into concise executive takeaways and central conclusions.
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
