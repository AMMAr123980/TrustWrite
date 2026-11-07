"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle,
  FileText,
  BarChart2,
  BookOpen,
  Lock,
  Wand2,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

const HERO_SAMPLES = [
  {
    label: "Student Assignment",
    text: "He don't know how to write professional emails. Their is alot of errors in this document that requires attention.\n\nAccording to Smith (2023), early literacy intervention enhances cognitive outcomes.",
  },
  {
    label: "Academic Draft",
    text: "In order to facilitate improved readability, researchers should utilize straightforward vocabulary and avoid unnecessary passive formulations. Consequently, structured variety enhances organic flow.",
  },
  {
    label: "Business Proposal",
    text: "Due to the fact that our quarterly user retention has declined, we must get rid of redundant onboarding stages and make sure clients receive instant support.",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Explainable Grammar Rules",
    trustwrite: "Full linguistic explanations with offset mapping",
    grammarly: "Basic suggestion box",
    gptzero: "No grammar tools",
  },
  {
    feature: "Deterministic Readability",
    trustwrite: "Flesch, Fog, ARI, CLI & passive voice in 0ms",
    grammarly: "Limited proprietary metric",
    gptzero: "None",
  },
  {
    feature: "Ethical AI Uncertainty Framework",
    trustwrite: "Stanford-informed non-accusatory signals",
    grammarly: "None",
    gptzero: "Presents score as proof of authorship",
  },
  {
    feature: "Citation Cross-Verification",
    trustwrite: "Matches in-text citations with bibliography & DOI",
    grammarly: "Limited to citations formatting",
    gptzero: "None",
  },
  {
    feature: "Live Web Verification",
    trustwrite: "Context.dev live crawling & markdown extraction",
    grammarly: "None",
    gptzero: "None",
  },
  {
    feature: "Zero-Retention Privacy",
    trustwrite: "Ephemeral processing & instant discard",
    grammarly: "Retained in user account",
    gptzero: "Varies by tier",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [quickText, setQuickText] = useState(HERO_SAMPLES[0].text);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleQuickReview = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("trustwrite_draft", quickText);
    }
    router.push("/app");
  };

  const wordCount = quickText.trim() ? quickText.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60 pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/90 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Writing Intelligence SaaS &bull; Free Core Tools</span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Write Better. Verify More.
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Communicate with Confidence.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              The complete writing intelligence workspace for students, researchers, and professionals.
              Explainable grammar, deterministic readability, citation matching, and ethical AI signals.
            </p>
          </div>

          {/* Interactive Hero Canvas Container */}
          <div className="mt-10 max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xl shadow-slate-200/60 transition-all">
            {/* Quick Sample Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span>Try sample:</span>
                {HERO_SAMPLES.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuickText(s.text)}
                    className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-slate-700 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {wordCount} words &bull; Free instant review
              </span>
            </div>

            <textarea
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder="Paste your essay, article, email or document here to inspect..."
              rows={5}
              className="mt-3.5 w-full resize-none font-serif text-slate-800 text-base leading-relaxed outline-none placeholder:text-slate-300"
            />

            {/* Bottom Bar */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Grammar & Homophones</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Readability Benchmarks</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-violet-500" />
                  <span>Ethical AI Signals</span>
                </span>
              </div>

              <button
                onClick={handleQuickReview}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Review My Writing</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Privacy Trust Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 select-none">
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>Zero-Storage Ephemeral Sessions</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Stanford Research-Informed Ethics</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>TXT, DOCX & PDF Export</span>
            </span>
          </div>
        </div>
      </section>

      {/* Public Page Compliant Ad Container */}
      <div className="max-w-5xl mx-auto px-4 w-full">
        <AdBanner format="horizontal" />
      </div>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Complete SaaS Engine
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Six Intelligence Modules in One Workspace
            </h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Every tool is engineered with algorithmic transparency, clear linguistic context, and zero punitive accusations.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group rounded-3xl border border-slate-200 bg-slate-50/60 p-7 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-slate-900">Grammar & Spell Engine</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Catches subject-verb agreement slips, homophone confusion (their/there/they&apos;re), punctuation spacing, and redundant wordiness with clear diagnostic explanations.
              </p>
              <Link href="/grammar-checker" className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 hover:underline">
                Explore Grammar Checker &rarr;
              </Link>
            </div>

            {/* Card 2 */}
            <div className="group rounded-3xl border border-slate-200 bg-slate-50/60 p-7 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-slate-900">Deterministic Readability</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog Index, Coleman-Liau, and passive voice distribution computed in milliseconds with zero LLM API latency.
              </p>
              <Link href="/readability-checker" className="mt-4 inline-flex items-center text-xs font-bold text-emerald-600 hover:underline">
                Explore Readability Suite &rarr;
              </Link>
            </div>

            {/* Card 3 */}
            <div className="group rounded-3xl border border-slate-200 bg-slate-50/60 p-7 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm shadow-violet-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-slate-900">Ethical AI Writing Signals</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Evaluates sentence burstiness and syntactic cadence. Guided by Stanford findings on multilingual writers, TrustWrite never treats scores as proof of authorship.
              </p>
              <Link href="/ai-writing-checker" className="mt-4 inline-flex items-center text-xs font-bold text-violet-600 hover:underline">
                Explore AI Signals Guide &rarr;
              </Link>
            </div>

            {/* Card 4 */}
            <div className="group rounded-3xl border border-slate-200 bg-slate-50/60 p-7 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5 transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm shadow-sky-500/20 group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-slate-900">Citation & Source Matcher</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Automatically extracts APA/MLA in-text citations, matches against bibliography entries, validates standard DOI structures, and verifies live sources via Context.dev.
              </p>
              <Link href="/citation-checker" className="mt-4 inline-flex items-center text-xs font-bold text-sky-600 hover:underline">
                Explore Citation Checker &rarr;
              </Link>
            </div>

            {/* Card 5 */}
            <div className="group rounded-3xl border border-slate-200 bg-slate-50/60 p-7 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Wand2 className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-slate-900">Tone & Clarity Assistant</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Elevate rough drafts into polished professional emails, concise academic paragraphs, or plain-English summaries with side-by-side diff previews.
              </p>
              <Link href="/writing-assistant" className="mt-4 inline-flex items-center text-xs font-bold text-indigo-600 hover:underline">
                Explore Writing Assistant &rarr;
              </Link>
            </div>

            {/* Card 6 */}
            <div className="group rounded-3xl border border-slate-200 bg-slate-50/60 p-7 hover:border-slate-400 hover:shadow-lg transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-slate-900">Publication PDF Reports</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Export publication-ready PDF writing reports with ReportLab, containing composite scores, readability benchmarks, and actionable revision checklists.
              </p>
              <Link href="/app" className="mt-4 inline-flex items-center text-xs font-bold text-slate-900 hover:underline">
                Generate Instant Report &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Clear Differentiation
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              How TrustWrite Compares
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Built for writers who value explanation, verification, and ethical transparency.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700">
                <tr>
                  <th className="p-4 sm:p-5">Capability</th>
                  <th className="p-4 sm:p-5 text-blue-700 bg-blue-50/60 font-black">TrustWrite</th>
                  <th className="p-4 sm:p-5 text-slate-500">Grammarly</th>
                  <th className="p-4 sm:p-5 text-slate-500">Basic AI Detectors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-slate-900">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-semibold text-blue-900 bg-blue-50/30">
                      {row.trustwrite}
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">{row.grammarly}</td>
                    <td className="p-4 sm:p-5 text-slate-500">{row.gptzero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section with Stateful Accordion */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Common Questions
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {[
              {
                q: "Is TrustWrite really free to use?",
                a: "Yes! TrustWrite operates on a Free + AdSense business model. All deterministic checks (readability suite, linguistic grammar suggestions, citation matching, and basic PDF report exports) are 100% free with no forced registration.",
              },
              {
                q: "Why does TrustWrite reject automated AI misconduct scores?",
                a: "A landmark study by Stanford-affiliated researchers revealed that automated AI detectors misclassify writing by non-native English speakers over 60% of the time. We report sentence burstiness and cadence as stylistic indicators solely to invite manual peer review.",
              },
              {
                q: "What does the Context.dev live web verification do?",
                a: "When your document references a DOI (like 10.1000/182) or external web URL, TrustWrite connects to Context.dev to crawl the live destination in real time, validating that the source is live and ingesting a clean markdown excerpt of the article.",
              },
              {
                q: "Are my documents stored or used to train public AI models?",
                a: "Never. In quick review mode, all content is processed ephemerally in server memory and discarded. We never retain, sell, or train public AI models on your private writing without explicit authorization.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-sm text-slate-900 hover:bg-slate-100/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
