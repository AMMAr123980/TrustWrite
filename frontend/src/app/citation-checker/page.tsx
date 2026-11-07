import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { BookOpen, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Online Citation & Source Checker | TrustWrite",
  description: "Verify in-text APA and MLA citations against your bibliography and check DOI format integrity automatically.",
};

export default function CitationCheckerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Academic & Research Suite
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold text-slate-900">
              Citation & Bibliography Checker
            </h1>
            <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Verify whether every in-text citation has a corresponding reference in your bibliography. Check standard DOI format validity and eliminate duplicate reference entries.
            </p>

            <div className="mt-8">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-700 transition-all"
              >
                <span>Launch Citation Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4">
          <AdBanner slotId="citation-checker-top" />
        </div>

        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Prevent Missing References in Academic Papers
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                One of the most frequent point deductions on student assignments and reviewer complaints on journal articles is the "phantom citation" — a citation in the body text (e.g. <i>(Smith, 2023)</i>) with no matching entry in the reference list.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-sky-600">APA & MLA In-Text Matcher</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Extracts parenthetical and narrative citations and verifies lead author and publication year in your bibliography.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-sky-600">DOI Format Validation</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Validates <code>10.XXXX/...</code> Digital Object Identifier structures to ensure your reference links resolve properly.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-sky-600">Duplicate Reference Detector</span>
                  <p className="mt-1 text-xs text-slate-600">
                    Finds accidentally duplicated sources in long bibliography lists.
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
