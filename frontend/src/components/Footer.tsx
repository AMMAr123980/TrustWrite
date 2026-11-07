import Link from "next/link";
import { Lock } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo size="sm" showTagline />
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Write Better. Verify More. Communicate with Confidence. TrustWrite is an integrated Writing Intelligence Workspace designed for students, educators, and professionals.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Zero-retention ephemeral privacy option</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Writing Tools
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/grammar-checker" className="hover:text-blue-600">Grammar & Spell Checker</Link></li>
              <li><Link href="/readability-checker" className="hover:text-blue-600">Readability Suite</Link></li>
              <li><Link href="/ai-writing-checker" className="hover:text-blue-600">AI Pattern Signals</Link></li>
              <li><Link href="/citation-checker" className="hover:text-blue-600">Citation & DOI Review</Link></li>
              <li><Link href="/writing-assistant" className="hover:text-blue-600">Tone & Clarity Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Academic & Ethics
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="text-xs leading-relaxed text-slate-500">
                Stanford researchers showed automated AI detectors can misclassify writing by non-native speakers.
              </li>
              <li className="text-xs leading-relaxed text-slate-500">
                TrustWrite never claims statistical pattern scores establish proof of authorship or misconduct.
              </li>
              <li><Link href="/how-it-works" className="text-xs font-medium text-blue-600 hover:underline">Read our Ethics Framework &rarr;</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Compliance & Legal
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600">Contact & Support</Link></li>
              <li className="text-xs text-slate-400 pt-2">
                &copy; {new Date().getFullYear()} TrustWrite. All rights reserved.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
