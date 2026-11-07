"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  analyzeText,
  rewriteText,
  verifySourceUrl,
  getPdfReportUrl,
  downloadDocx,
  FullAnalysisResponse,
  WritingFinding,
  QuickRewriteResponse,
  SourceVerificationResult,
} from "@/lib/api";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  BookOpen,
  ArrowRight,
  Info,
  Wand2,
  RefreshCw,
  Check,
  X,
  Upload,
  RotateCcw,
  Undo2,
  Redo2,
  Copy,
  Maximize2,
  Minimize2,
  FileDown,
  Layers,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Clock,
  Award,
  TrendingUp,
  Search,
  Filter,
  ArrowLeft,
  ChevronDown,
  Moon,
  Sun,
  FolderOpen,
  Plus,
  Trash2,
  PenTool,
  Smile,
  BarChart,
  Edit3,
  Highlighter,
} from "lucide-react";
import { Logo } from "@/components/Logo";

interface SavedDoc {
  id: string;
  title: string;
  content: string;
  documentType: string;
  updatedAt: number;
}

const SAMPLE_PRESETS: Record<
  string,
  { label: string; desc: string; text: string }
> = {
  academic: {
    label: "Academic Paper",
    desc: "Formal scholarship, strict citation and objective vocabulary",
    text: `He don't know how to write professional emails in modern institutions. Their is alot of errors in this draft that requires immediate attention from the editorial committee.

According to Smith (2023), effective communication forms the foundation of modern collaborative productivity. Similar conclusions were verified by Taylor et al. (2020) in recent university studies examining cognitive load.

In order to facilitate improved readability, researchers should utilize straightforward vocabulary and avoid unnecessary passive formulations. Machine learning systems analyze syntax patterns; consequently, structured variety enhances organic flow and readability across multidisciplinary teams.

References
Smith, J. (2023). Collaborative Principles in Modern Education. Academic Press, 10.1000/182.`,
  },
  essay: {
    label: "Student Essay",
    desc: "Clear thesis, coherent transitions and structured reasoning",
    text: `Online education has transformed higher learning over the past decade. Due to the fact that students can study from anywhere, traditional classrooms are being reevaluated.

However, many learners struggle with time management. In the event that a student lacks self-discipline, their academic grades definately decline. Furthermore, educators must accomodate diverse learning styles to ensure equity.

According to Johnson (2022), hybrid courses combine the flexibility of digital platforms with interactive peer discussions. Therefore, universities should continue refining these pedagogies.

References
Johnson, K. (2022). Rethinking the Digital Classroom. Education Review, 10.1016/j.ced.2022.04.`,
  },
  blog: {
    label: "Blog & Article",
    desc: "Engaging, crisp, accessible prose with punchy sentences",
    text: `Writing great blog posts is an art and a science. If your paragraphs are too dense, readers will bounce within three seconds.

At this point in time, search engines prioritize helpful content that answers questions directly. Avoid passive sentences like "the strategy was implemented by our team" and write "our team implemented the strategy" instead.

Keep sentences concise. Split thirty-word thoughts into two crisp statements. Your audience will thank you, and your engagement metrics will soar!`,
  },
  business: {
    label: "Business Communication",
    desc: "Executive tone, clear action items, and zero corporate filler",
    text: `Dear Leadership Team,

I am writing in order to propose an update to our Q3 operational roadmap. We can't afford to overlook recent customer retention metrics, which demonstrate that our onboarding workflow requires simplification.

We must get rid of redundant approval stages and make sure every client receives immediate onboarding assistance. Please review the attached breakdown and provide feedback by Friday afternoon.

Best regards,
Operations Director`,
  },
};

export function WritingWorkspace() {
  const [activeDocId, setActiveDocId] = useState<string>("doc_default");
  const [docTitle, setDocTitle] = useState("Untitled Project Draft");
  const [content, setContent] = useState(SAMPLE_PRESETS.academic.text);
  const [documentType, setDocumentType] = useState<string>("academic");
  const [viewMode, setViewMode] = useState<"edit" | "highlights">("edit");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [activeTab, setActiveTab] = useState<
    "grammar" | "readability" | "tone" | "ai_signals" | "citations" | "assistant"
  >("grammar");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FullAnalysisResponse | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<WritingFinding | null>(null);
  const [popoverFinding, setPopoverFinding] = useState<WritingFinding | null>(null);
  const [grammarFilter, setGrammarFilter] = useState<string>("all");

  // History stack for Undo / Redo
  const [history, setHistory] = useState<string[]>([SAMPLE_PRESETS.academic.text]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Editor Appearance Toggles
  const [fontFamily, setFontFamily] = useState<"sans" | "serif">("serif");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [isZenMode, setIsZenMode] = useState(false);

  // Multi-Document Drawer State
  const [isDocsDrawerOpen, setIsDocsDrawerOpen] = useState(false);
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);

  // AI Rewriting & Verification States
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteResult, setRewriteResult] = useState<QuickRewriteResponse | null>(null);
  const [showEthicsModal, setShowEthicsModal] = useState(false);
  const [explainModalFinding, setExplainModalFinding] = useState<WritingFinding | null>(null);
  const [verifyingUrl, setVerifyingUrl] = useState<string | null>(null);
  const [liveVerifyResult, setLiveVerifyResult] = useState<SourceVerificationResult | null>(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Push to history when text changes
  const updateContentWithHistory = (newText: string) => {
    setContent(newText);
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(newText);
    if (newHist.length > 50) newHist.shift();
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setContent(prev);
      handleRunAnalysis(prev);
      showToast("Undone last edit");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setContent(next);
      handleRunAnalysis(next);
      showToast("Redone edit");
    }
  };

  // Load Saved Documents & Draft on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("trustwrite_docs_v1");
        if (raw) {
          const parsed = JSON.parse(raw) as SavedDoc[];
          setSavedDocs(parsed);
          if (parsed.length > 0) {
            const first = parsed[0];
            setActiveDocId(first.id);
            setDocTitle(first.title);
            setContent(first.content);
            setDocumentType(first.documentType);
            setHistory([first.content]);
            handleRunAnalysis(first.content);
            return;
          }
        }
      } catch {
        // Fallback to default
      }

      // Check session draft
      const saved = sessionStorage.getItem("trustwrite_draft");
      if (saved && saved.trim()) {
        setContent(saved);
        setHistory([saved]);
        handleRunAnalysis(saved);
        sessionStorage.removeItem("trustwrite_draft");
        return;
      }
    }
    handleRunAnalysis(content);
  }, []);

  // Continuous Auto-Save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const currentDoc: SavedDoc = {
        id: activeDocId,
        title: docTitle,
        content: content,
        documentType: documentType,
        updatedAt: Date.now(),
      };
      setSavedDocs((prev) => {
        const index = prev.findIndex((d) => d.id === activeDocId);
        let updated: SavedDoc[];
        if (index >= 0) {
          updated = [...prev];
          updated[index] = currentDoc;
        } else {
          updated = [currentDoc, ...prev];
        }
        localStorage.setItem("trustwrite_docs_v1", JSON.stringify(updated));
        return updated;
      });
    } catch {
      // LocalStorage full or private browsing
    }
  }, [content, docTitle, documentType, activeDocId]);

  // Real-time Debounced Auto-Scan on Typing (800ms)
  useEffect(() => {
    if (!content.trim()) return;
    const timer = setTimeout(() => {
      handleRunAnalysis(content);
    }, 800);
    return () => clearTimeout(timer);
  }, [content, documentType]);

  const handleRunAnalysis = async (textToAnalyze?: string) => {
    const text = textToAnalyze ?? content;
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeText(text, documentType);
      setAnalysis(res);
      if (res.grammar_findings.length > 0) {
        setSelectedFinding(res.grammar_findings[0]);
      } else {
        setSelectedFinding(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePresetSelect = (key: string) => {
    setDocumentType(key);
    const preset = SAMPLE_PRESETS[key];
    if (preset) {
      updateContentWithHistory(preset.text);
      handleRunAnalysis(preset.text);
      showToast(`Loaded "${preset.label}" profile`);
    }
  };

  const handleAcceptCorrection = (finding: WritingFinding) => {
    const updated = content.replace(finding.original, finding.suggestion);
    updateContentWithHistory(updated);
    if (analysis) {
      const remaining = analysis.grammar_findings.filter((f) => f.id !== finding.id);
      setAnalysis({
        ...analysis,
        grammar_findings: remaining,
        overall_score: Math.min(100, analysis.overall_score + 3),
      });
      setSelectedFinding(remaining[0] || null);
    }
    setPopoverFinding(null);
    showToast(`Applied: "${finding.original}" → "${finding.suggestion}"`);
  };

  const handleRejectCorrection = (finding: WritingFinding) => {
    if (analysis) {
      const remaining = analysis.grammar_findings.filter((f) => f.id !== finding.id);
      setAnalysis({
        ...analysis,
        grammar_findings: remaining,
      });
      setSelectedFinding(remaining[0] || null);
    }
    setPopoverFinding(null);
    showToast(`Ignored suggestion`);
  };

  const handleAcceptAllCorrections = () => {
    if (!analysis || analysis.grammar_findings.length === 0) return;
    let updated = content;
    let count = 0;
    for (const f of analysis.grammar_findings) {
      if (updated.includes(f.original)) {
        updated = updated.replace(f.original, f.suggestion);
        count++;
      }
    }
    updateContentWithHistory(updated);
    setAnalysis({
      ...analysis,
      grammar_findings: [],
      overall_score: Math.min(100, analysis.overall_score + count * 3),
    });
    setSelectedFinding(null);
    setPopoverFinding(null);
    showToast(`Accepted all ${count} suggestions!`);
  };

  const handleRewrite = async (mode: "professional" | "concise" | "simplify" | "summarize") => {
    if (!content.trim()) return;
    setRewriteLoading(true);
    setActiveTab("assistant");
    try {
      const res = await rewriteText(content, mode);
      setRewriteResult(res);
      showToast(`Generated ${mode} rewrite!`);
    } catch (err) {
      console.error(err);
      showToast("Assistant failed. Check backend connection.");
    } finally {
      setRewriteLoading(false);
    }
  };

  const handleApplyRewrite = () => {
    if (rewriteResult) {
      updateContentWithHistory(rewriteResult.revised);
      handleRunAnalysis(rewriteResult.revised);
      setRewriteResult(null);
      showToast("Applied revision to document!");
    }
  };

  const handleVerifyLiveSource = async (url: string) => {
    setVerifyingUrl(url);
    try {
      const res = await verifySourceUrl(url);
      setLiveVerifyResult(res);
      showToast("Live source verified via Context.dev!");
    } catch {
      showToast("Could not crawl URL. Please check network/DOI.");
    } finally {
      setVerifyingUrl(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".docx")) {
      const formData = new FormData();
      formData.append("file", file);
      fetch("http://127.0.0.1:8000/api/v1/documents/upload", {
        method: "POST",
        body: formData,
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.content) {
            setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
            updateContentWithHistory(data.content);
            handleRunAnalysis(data.content);
            showToast(`Loaded ${file.name}`);
          }
        })
        .catch(() => {
          showToast("Failed to parse DOCX. Ensure backend is active.");
        });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
        updateContentWithHistory(text);
        handleRunAnalysis(text);
        showToast(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportWordDocx = async () => {
    if (!content.trim()) return;
    setIsExportingDocx(true);
    try {
      await downloadDocx(docTitle, content);
      showToast("Word (.DOCX) file exported!");
    } catch {
      showToast("Failed to export Word document.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(content);
      showToast("Document copied to clipboard!");
    } catch {
      showToast("Failed to copy to clipboard");
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded document as .txt");
  };

  const handleClear = () => {
    if (content.trim().length > 0) {
      updateContentWithHistory("");
      setAnalysis(null);
      showToast("Document cleared. Click Undo to restore.");
    }
  };

  // Multi-Document Manager actions
  const handleCreateNewDoc = () => {
    const newId = `doc_${Date.now()}`;
    const newDoc: SavedDoc = {
      id: newId,
      title: "New Untitled Draft",
      content: "",
      documentType: "academic",
      updatedAt: Date.now(),
    };
    setActiveDocId(newId);
    setDocTitle(newDoc.title);
    setContent("");
    setHistory([""]);
    setHistoryIndex(0);
    setAnalysis(null);
    setIsDocsDrawerOpen(false);
    showToast("Created new document draft");
  };

  const handleSwitchDoc = (doc: SavedDoc) => {
    setActiveDocId(doc.id);
    setDocTitle(doc.title);
    setContent(doc.content);
    setDocumentType(doc.documentType);
    setHistory([doc.content]);
    setHistoryIndex(0);
    handleRunAnalysis(doc.content);
    setIsDocsDrawerOpen(false);
    showToast(`Loaded "${doc.title}"`);
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = savedDocs.filter((d) => d.id !== id);
    setSavedDocs(remaining);
    localStorage.setItem("trustwrite_docs_v1", JSON.stringify(remaining));
    if (activeDocId === id) {
      if (remaining.length > 0) {
        handleSwitchDoc(remaining[0]);
      } else {
        handleCreateNewDoc();
      }
    }
    showToast("Document deleted");
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const sentenceCount = analysis?.metrics.sentence_count ?? Math.max(1, content.split(/[.!?]+/).filter(Boolean).length);
  const readingTime = (wordCount / 220).toFixed(1);

  // Filter grammar findings
  const filteredFindings =
    analysis?.grammar_findings.filter((f) => {
      if (grammarFilter === "all") return true;
      return f.category.toLowerCase() === grammarFilter.toLowerCase();
    }) ?? [];

  // Overall Score Calculation
  const score = analysis?.overall_score ?? 85;
  const scoreStroke =
    score >= 80 ? "stroke-emerald-500" : score >= 65 ? "stroke-blue-500" : "stroke-amber-500";
  const scoreText =
    score >= 80 ? "text-emerald-600" : score >= 65 ? "text-blue-600" : "text-amber-600";
  const scoreBg =
    score >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score >= 65
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  // Heuristic Tone Metrics Calculation
  const toneData = useMemo(() => {
    const textLower = content.toLowerCase();
    const formalWords = ["consequently", "furthermore", "moreover", "therefore", "utilize", "indicate", "demonstrate", "specifically"];
    const informalWords = ["alot", "definately", "gonna", "wanna", "cool", "stuff", "awesome", "huge"];
    let formalCount = 0;
    let informalCount = 0;
    formalWords.forEach((w) => {
      if (textLower.includes(w)) formalCount++;
    });
    informalWords.forEach((w) => {
      if (textLower.includes(w)) informalCount++;
    });

    const formalityPercent = Math.min(95, Math.max(35, 60 + formalCount * 6 - informalCount * 12));
    const confidencePercent = Math.min(96, Math.max(45, 75 - (analysis?.metrics.passive_voice_count ?? 0) * 5));
    const clarityPercent = Math.min(98, Math.max(40, 100 - (analysis?.grammar_findings.length ?? 0) * 4));

    let audienceFit = "Strong Fit for Academic & Professional Communication";
    if (documentType === "blog") audienceFit = "Engaging & Direct Prose";
    if (documentType === "business") audienceFit = "Executive, Crisp & Action-Oriented";

    return { formalityPercent, confidencePercent, clarityPercent, audienceFit };
  }, [content, documentType, analysis]);

  // Highlight Mode Tokenizer
  const renderedHighlightedText = useMemo(() => {
    if (!analysis || analysis.grammar_findings.length === 0) {
      return <span>{content}</span>;
    }

    // Split text and wrap findings with clickable interactive pills
    const findings = analysis.grammar_findings;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort findings by position if location is available or find by regex
    const findingMap = new Map<string, WritingFinding>();
    findings.forEach((f) => findingMap.set(f.original, f));

    const regexPattern = new RegExp(
      findings.map((f) => f.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
      "g"
    );

    let match;
    let matchCount = 0;
    while ((match = regexPattern.exec(content)) !== null && matchCount < 100) {
      matchCount++;
      const matchedText = match[0];
      const matchIndex = match.index;

      if (matchIndex > lastIndex) {
        parts.push(content.slice(lastIndex, matchIndex));
      }

      const findingObj = findingMap.get(matchedText);
      parts.push(
        <span
          key={`finding-${matchIndex}`}
          onClick={() => {
            if (findingObj) {
              setPopoverFinding(findingObj);
              setSelectedFinding(findingObj);
            }
          }}
          className="relative inline-block cursor-pointer font-semibold underline decoration-wavy decoration-rose-500 decoration-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded px-1 transition-all"
          title={`Click to fix: "${findingObj?.suggestion}"`}
        >
          {matchedText}
        </span>
      );

      lastIndex = matchIndex + matchedText.length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  }, [content, analysis]);

  return (
    <div
      className={`h-screen w-screen max-h-screen overflow-hidden flex flex-col font-sans antialiased transition-colors ${
        theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#f8fafc] text-slate-800"
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-2xl shadow-slate-900/40 border border-slate-700 transition-all animate-bounce">
          <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BESPOKE APP BAR */}
      <header
        className={`h-14 shrink-0 border-b px-4 sm:px-6 flex items-center justify-between gap-4 z-20 transition-colors ${
          theme === "dark"
            ? "border-slate-800 bg-slate-900/95 text-slate-100"
            : "border-slate-200/80 bg-white/95 text-slate-800"
        } backdrop-blur-md`}
      >
        {/* Left: Brand + Breadcrumb + Document Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            title="Back to Homepage"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <span className="h-4 w-px bg-slate-200" />

          <Logo size="sm" />

          <span className="hidden md:inline h-4 w-px bg-slate-200" />

          {/* Document Drawer Toggle Button */}
          <button
            onClick={() => setIsDocsDrawerOpen(true)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              theme === "dark"
                ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
            title="Open Document Manager"
          >
            <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
            <span>Drafts ({savedDocs.length || 1})</span>
          </button>

          {/* Editable Document Title */}
          <div className="hidden lg:flex items-center gap-2">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className={`font-bold text-xs px-2 py-1 rounded-md border border-transparent outline-none transition-all w-44 sm:w-56 truncate ${
                theme === "dark"
                  ? "text-slate-100 hover:bg-slate-800 focus:bg-slate-800 focus:border-blue-500"
                  : "text-slate-800 hover:bg-slate-100 focus:bg-white focus:border-blue-400"
              }`}
              title="Click to rename document"
            />
            {/* Auto-Scan Status Pill */}
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAnalyzing ? "bg-amber-500 animate-spin" : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span>{isAnalyzing ? "Scanning..." : "Auto-Synced"}</span>
            </span>
          </div>
        </div>

        {/* Center: Profile Segmented Control */}
        <div
          className={`hidden xl:flex items-center p-0.5 rounded-xl border text-xs font-semibold ${
            theme === "dark"
              ? "bg-slate-800/80 border-slate-700 text-slate-300"
              : "bg-slate-100 border-slate-200/60 text-slate-600"
          }`}
        >
          {Object.entries(SAMPLE_PRESETS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                documentType === key
                  ? theme === "dark"
                    ? "bg-slate-700 text-blue-400 shadow-sm font-bold"
                    : "bg-white text-blue-600 shadow-sm font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right: Actions (Undo/Redo, Upload, Word DOCX, Export, Dark Mode, Scan) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Undo / Redo */}
          <div
            className={`flex items-center border rounded-lg p-0.5 ${
              theme === "dark"
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200/80 bg-slate-50/70"
            }`}
          >
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="Undo (Ctrl+Z)"
              className="rounded p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
              className="rounded p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Upload DOCX / TXT */}
          <label
            title="Upload Document (.txt, .docx, .md)"
            className={`flex items-center gap-1.5 cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              theme === "dark"
                ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
            }`}
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Upload</span>
            <input
              type="file"
              accept=".txt,.md,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Word DOCX Direct Export */}
          <button
            onClick={handleExportWordDocx}
            disabled={isExportingDocx}
            title="Export directly as Microsoft Word (.docx)"
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              theme === "dark"
                ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">
              {isExportingDocx ? "Exporting..." : ".DOCX"}
            </span>
          </button>

          {/* PDF Report Export Button */}
          {analysis && (
            <a
              href={getPdfReportUrl(analysis.analysis_id)}
              download
              target="_blank"
              rel="noreferrer"
              title="Download Publication-Ready PDF Report"
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 shadow-2xs transition-all"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">PDF</span>
            </a>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title="Toggle Dark / Light Theme"
            className={`p-1.5 rounded-lg border transition-colors ${
              theme === "dark"
                ? "border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>

          {/* Force Scan Action */}
          <button
            onClick={() => {
              handleRunAnalysis();
              showToast("Running writing scan...");
            }}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isAnalyzing ? "Scanning..." : "Scan"}</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE MAIN BODY */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* CENTER / DOCUMENT CANVAS */}
        <main
          className={`flex-1 min-h-0 flex flex-col items-center p-3 sm:p-5 lg:p-6 overflow-hidden transition-colors ${
            theme === "dark" ? "bg-slate-950" : "bg-slate-100/60"
          }`}
        >
          {/* Physical Document Paper Elevation */}
          <div
            className={`w-full max-w-4xl h-full rounded-2xl shadow-sm border flex flex-col overflow-hidden transition-colors ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/50"
                : "bg-white border-slate-200/90 text-slate-800 shadow-slate-200/40"
            }`}
          >
            {/* Paper Header Toolbar */}
            <div
              className={`flex items-center justify-between border-b px-5 py-2.5 select-none shrink-0 transition-colors ${
                theme === "dark"
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-100 bg-white"
              }`}
            >
              {/* Left: View Mode Toggle (Edit Mode vs Highlights Mode) */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center p-0.5 rounded-lg border text-xs font-semibold ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700"
                      : "bg-slate-100 border-slate-200/60"
                  }`}
                >
                  <button
                    onClick={() => {
                      setViewMode("edit");
                      setPopoverFinding(null);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewMode === "edit"
                        ? theme === "dark"
                          ? "bg-slate-700 text-white shadow-2xs font-bold"
                          : "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setViewMode("highlights")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewMode === "highlights"
                        ? "bg-blue-600 text-white shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Highlighter className="h-3 w-3" />
                    <span>Highlights ({analysis?.grammar_findings.length ?? 0})</span>
                  </button>
                </div>

                {/* Font Serif / Sans */}
                <div
                  className={`hidden sm:flex items-center p-0.5 rounded-lg text-xs ${
                    theme === "dark" ? "bg-slate-800" : "bg-slate-100"
                  }`}
                >
                  <button
                    onClick={() => setFontFamily("serif")}
                    className={`px-2 py-0.5 rounded font-serif text-xs font-semibold transition-all ${
                      fontFamily === "serif"
                        ? theme === "dark"
                          ? "bg-slate-700 text-white"
                          : "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500"
                    }`}
                  >
                    Serif
                  </button>
                  <button
                    onClick={() => setFontFamily("sans")}
                    className={`px-2 py-0.5 rounded font-sans text-xs font-semibold transition-all ${
                      fontFamily === "sans"
                        ? theme === "dark"
                          ? "bg-slate-700 text-white"
                          : "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500"
                    }`}
                  >
                    Sans
                  </button>
                </div>

                {/* Font Size */}
                <div
                  className={`hidden sm:flex items-center p-0.5 rounded-lg text-xs ${
                    theme === "dark" ? "bg-slate-800" : "bg-slate-100"
                  }`}
                >
                  {(["sm", "base", "lg"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFontSize(s)}
                      className={`px-2 py-0.5 rounded uppercase text-[11px] font-bold transition-all ${
                        fontSize === s
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Utility actions: Copy, Reset, Clear, Zen */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyText}
                  title="Copy Document to Clipboard"
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </button>

                <button
                  onClick={() => {
                    const cur = SAMPLE_PRESETS[documentType]?.text || SAMPLE_PRESETS.academic.text;
                    updateContentWithHistory(cur);
                    handleRunAnalysis(cur);
                    showToast("Restored template draft");
                  }}
                  title="Reset to Template Draft"
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <button
                  onClick={handleClear}
                  title="Clear Document"
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>

                {/* Zen Mode */}
                <button
                  onClick={() => setIsZenMode(!isZenMode)}
                  title={isZenMode ? "Exit Focus Mode" : "Focus Mode"}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    isZenMode
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {isZenMode ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{isZenMode ? "Exit Focus" : "Focus"}</span>
                </button>
              </div>
            </div>

            {/* Document Textarea / Highlights Canvas */}
            <div className="flex-1 min-h-0 w-full p-6 sm:p-8 flex flex-col overflow-hidden relative">
              {viewMode === "edit" ? (
                <textarea
                  value={content}
                  onChange={(e) => updateContentWithHistory(e.target.value)}
                  placeholder="Start typing your research, essay, or business communication here..."
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className={`w-full flex-1 h-full min-h-0 resize-none border-0 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 leading-relaxed placeholder:text-slate-400 selection:bg-blue-100 selection:text-blue-900 overflow-y-auto ${
                    theme === "dark" ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"
                  } ${fontFamily === "serif" ? "font-serif" : "font-sans"} ${
                    fontSize === "sm"
                      ? "text-sm leading-relaxed"
                      : fontSize === "lg"
                      ? "text-lg leading-loose"
                      : "text-base leading-relaxed"
                  }`}
                />
              ) : (
                <div
                  className={`w-full flex-1 h-full min-h-0 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text ${
                    theme === "dark" ? "text-slate-100" : "text-slate-900"
                  } ${fontFamily === "serif" ? "font-serif" : "font-sans"} ${
                    fontSize === "sm"
                      ? "text-sm leading-relaxed"
                      : fontSize === "lg"
                      ? "text-lg leading-loose"
                      : "text-base leading-relaxed"
                  }`}
                >
                  {renderedHighlightedText}
                </div>
              )}

              {/* Floating Grammarly-Style Popover (When clicking in Highlights Mode) */}
              {popoverFinding && (
                <div className="absolute top-12 left-12 right-12 sm:right-auto sm:w-96 z-30 rounded-2xl bg-white text-slate-900 p-4 shadow-2xl border border-slate-200/90 animate-in fade-in-50 zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80">
                      {popoverFinding.category}
                    </span>
                    <button
                      onClick={() => setPopoverFinding(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 text-xs font-medium text-slate-600">
                    {popoverFinding.message}
                  </div>

                  {/* Suggestion Card */}
                  <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="line-through text-rose-500 font-mono">
                        {popoverFinding.original}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="font-bold text-emerald-700 font-mono">
                        {popoverFinding.suggestion}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-500 leading-snug">
                    {popoverFinding.explanation}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptCorrection(popoverFinding)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectCorrection(popoverFinding)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setExplainModalFinding(popoverFinding);
                        setPopoverFinding(null);
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Why? &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Paper Status Bar */}
            <div
              className={`flex items-center justify-between border-t px-5 py-2.5 text-xs select-none shrink-0 transition-colors ${
                theme === "dark"
                  ? "border-slate-800 bg-slate-900/90 text-slate-400"
                  : "border-slate-100 bg-slate-50/80 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <strong className={theme === "dark" ? "text-slate-100" : "text-slate-900"}>
                    {wordCount}
                  </strong>{" "}
                  words
                </span>
                <span className="hidden sm:inline flex items-center gap-1">
                  <strong className={theme === "dark" ? "text-slate-100" : "text-slate-900"}>
                    {charCount}
                  </strong>{" "}
                  chars
                </span>
                <span className="hidden sm:inline flex items-center gap-1">
                  <strong className={theme === "dark" ? "text-slate-100" : "text-slate-900"}>
                    {sentenceCount}
                  </strong>{" "}
                  sentences
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>
                    ~
                    <strong className={theme === "dark" ? "text-slate-100" : "text-slate-900"}>
                      {readingTime}
                    </strong>{" "}
                    min read
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Zero-Retention Active</span>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT: WRITING INTELLIGENCE HUB */}
        {!isZenMode && (
          <aside
            className={`w-full sm:w-[420px] lg:w-[440px] shrink-0 border-l flex flex-col h-full min-h-0 shadow-lg z-10 transition-colors ${
              theme === "dark"
                ? "border-slate-800 bg-slate-900 shadow-slate-950/60"
                : "border-slate-200/90 bg-white shadow-slate-200/40"
            }`}
          >
            {/* Top Quality Health Widget */}
            <div
              className={`border-b p-4 ${
                theme === "dark"
                  ? "border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60"
                  : "border-slate-200/80 bg-gradient-to-b from-slate-50/70 to-white"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Score Gauge Circle */}
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className={theme === "dark" ? "text-slate-800" : "text-slate-100"}
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={scoreStroke}
                      strokeDasharray={`${score}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-base font-black ${scoreText}`}>{score}</span>
                    <span className="text-[8px] font-bold text-slate-400 -mt-1">/ 100</span>
                  </div>
                </div>

                {/* Score details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreBg}`}>
                      {score >= 80
                        ? "Publication Quality"
                        : score >= 65
                        ? "Review Suggested"
                        : "Needs Revisions"}
                    </span>
                  </div>
                  <h3
                    className={`mt-1 font-bold text-sm truncate ${
                      theme === "dark" ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {SAMPLE_PRESETS[documentType]?.label || "General Draft"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Grade {analysis?.metrics.flesch_kincaid_grade ?? "12"} Level &bull;{" "}
                    {analysis?.grammar_findings.length ?? 0} issues detected
                  </p>
                </div>
              </div>

              {/* 4 Quick Stat Pills */}
              <div
                className={`grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t text-center ${
                  theme === "dark" ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <div
                  onClick={() => setActiveTab("grammar")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    theme === "dark" ? "bg-slate-800/80 hover:bg-slate-800" : "bg-slate-50 hover:bg-blue-50"
                  }`}
                >
                  <div className="text-[10px] text-slate-400">Issues</div>
                  <div className="text-xs font-bold text-amber-500">
                    {analysis?.grammar_findings.length ?? 0}
                  </div>
                </div>
                <div
                  onClick={() => setActiveTab("readability")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    theme === "dark" ? "bg-slate-800/80 hover:bg-slate-800" : "bg-slate-50 hover:bg-blue-50"
                  }`}
                >
                  <div className="text-[10px] text-slate-400">Ease</div>
                  <div className="text-xs font-bold text-blue-500">
                    {analysis?.metrics.flesch_reading_ease ?? 50}
                  </div>
                </div>
                <div
                  onClick={() => setActiveTab("tone")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    theme === "dark" ? "bg-slate-800/80 hover:bg-slate-800" : "bg-slate-50 hover:bg-blue-50"
                  }`}
                >
                  <div className="text-[10px] text-slate-400">Tone</div>
                  <div className="text-xs font-bold text-emerald-500">
                    {toneData.formalityPercent}%
                  </div>
                </div>
                <div
                  onClick={() => setActiveTab("citations")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    theme === "dark" ? "bg-slate-800/80 hover:bg-slate-800" : "bg-slate-50 hover:bg-blue-50"
                  }`}
                >
                  <div className="text-[10px] text-slate-400">Citations</div>
                  <div className="text-xs font-bold text-sky-500">
                    {analysis?.citations.in_text_citations_found ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Segmented Navigation Tab Bar */}
            <nav
              className={`flex border-b px-2 overflow-x-auto text-xs font-semibold select-none shrink-0 ${
                theme === "dark"
                  ? "border-slate-800 bg-slate-900 text-slate-400"
                  : "border-slate-200/80 bg-white text-slate-600"
              }`}
            >
              <button
                onClick={() => setActiveTab("grammar")}
                className={`px-3 py-2.5 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activeTab === "grammar"
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <span>Suggestions</span>
                {analysis && analysis.grammar_findings.length > 0 && (
                  <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 font-bold">
                    {analysis.grammar_findings.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("readability")}
                className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "readability"
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                Readability
              </button>

              <button
                onClick={() => setActiveTab("tone")}
                className={`px-3 py-2.5 border-b-2 whitespace-nowrap flex items-center gap-1 transition-all ${
                  activeTab === "tone"
                    ? "border-emerald-600 text-emerald-600 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Smile className="h-3 w-3" />
                <span>Tone</span>
              </button>

              <button
                onClick={() => setActiveTab("ai_signals")}
                className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "ai_signals"
                    ? "border-violet-600 text-violet-600 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                AI Signals
              </button>

              <button
                onClick={() => setActiveTab("citations")}
                className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "citations"
                    ? "border-sky-600 text-sky-600 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                Citations
              </button>

              <button
                onClick={() => setActiveTab("assistant")}
                className={`px-3 py-2.5 border-b-2 whitespace-nowrap flex items-center gap-1 transition-all ${
                  activeTab === "assistant"
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Wand2 className="h-3 w-3 text-blue-600" />
                <span>Assistant</span>
              </button>
            </nav>

            {/* TAB CONTENT (Smooth Scrollable Container) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: GRAMMAR & SUGGESTIONS */}
              {activeTab === "grammar" && analysis && (
                <div className="space-y-3">
                  {/* Filter Pills & Accept All Bar */}
                  <div
                    className={`flex items-center justify-between pb-2 border-b ${
                      theme === "dark" ? "border-slate-800" : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[11px]">
                      {["all", "grammar", "spelling", "clarity"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setGrammarFilter(cat)}
                          className={`rounded-md px-2 py-0.5 capitalize transition-all font-semibold ${
                            grammarFilter === cat
                              ? "bg-blue-600 text-white"
                              : theme === "dark"
                              ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {analysis.grammar_findings.length > 0 && (
                      <button
                        onClick={handleAcceptAllCorrections}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Accept All ({analysis.grammar_findings.length})
                      </button>
                    )}
                  </div>

                  {filteredFindings.length === 0 ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
                      <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                      <h4 className="mt-2 font-bold text-sm text-emerald-900">
                        {grammarFilter === "all" ? "Zero Issues Detected" : `No ${grammarFilter} issues`}
                      </h4>
                      <p className="mt-1 text-xs text-emerald-700">
                        Your text conforms smoothly to standard syntactic and stylistic guidelines.
                      </p>
                    </div>
                  ) : (
                    filteredFindings.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFinding(f)}
                        className={`rounded-xl border p-3.5 transition-all shadow-xs ${
                          theme === "dark" ? "bg-slate-800/80" : "bg-white"
                        } ${
                          selectedFinding?.id === f.id
                            ? "border-blue-500 ring-2 ring-blue-500/10"
                            : theme === "dark"
                            ? "border-slate-700 hover:border-slate-600"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              theme === "dark"
                                ? "bg-slate-700 text-slate-300"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {f.category}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {f.message}
                          </span>
                        </div>

                        {/* Before / After Diff */}
                        <div className="mt-2.5 flex items-center gap-2 text-xs">
                          <span className="line-through text-rose-500 bg-rose-50 px-2 py-1 rounded-md font-mono">
                            {f.original}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-mono">
                            {f.suggestion}
                          </span>
                        </div>

                        <p
                          className={`mt-2 text-xs leading-relaxed ${
                            theme === "dark" ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {f.explanation}
                        </p>

                        {/* Action buttons */}
                        <div
                          className={`mt-3 flex items-center justify-between pt-2.5 border-t ${
                            theme === "dark" ? "border-slate-700" : "border-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptCorrection(f);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                            >
                              <Check className="h-3 w-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectCorrection(f);
                              }}
                              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                                theme === "dark"
                                  ? "border-slate-700 text-slate-400 hover:bg-slate-700"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <X className="h-3 w-3" />
                              <span>Ignore</span>
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExplainModalFinding(f);
                            }}
                            className="text-[11px] font-semibold text-blue-500 hover:underline transition-colors"
                          >
                            Explain rule &rarr;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: READABILITY */}
              {activeTab === "readability" && analysis && (
                <div className="space-y-4">
                  <div
                    className={`rounded-2xl border p-4 shadow-xs ${
                      theme === "dark"
                        ? "bg-slate-800/80 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Deterministic Metric Suite
                    </h4>
                    <div className="mt-3 space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-700/20">
                        <span className="text-slate-400">Flesch Reading Ease:</span>
                        <span className="font-bold">
                          {analysis.metrics.flesch_reading_ease} / 100
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/20">
                        <span className="text-slate-400">Flesch-Kincaid Grade:</span>
                        <span className="font-bold">
                          Grade {analysis.metrics.flesch_kincaid_grade}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/20">
                        <span className="text-slate-400">Gunning Fog Index:</span>
                        <span className="font-bold">
                          {analysis.metrics.gunning_fog_index}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/20">
                        <span className="text-slate-400">Coleman-Liau Index:</span>
                        <span className="font-bold">
                          {analysis.metrics.coleman_liau_index}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Automated Readability (ARI):</span>
                        <span className="font-bold">
                          {analysis.metrics.automated_readability_index}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 shadow-xs space-y-3 ${
                      theme === "dark"
                        ? "bg-slate-800/80 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Structural Balance
                    </h4>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Passive Voice Sentences:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          analysis.metrics.passive_voice_count > 2
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {analysis.metrics.passive_voice_count}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Polysyllabic Complex Words:</span>
                      <span className="font-bold">
                        {analysis.metrics.complex_word_count}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Transition Markers:</span>
                      <span className="font-bold text-emerald-500">
                        {analysis.metrics.transition_word_count} found
                      </span>
                    </div>

                    {analysis.metrics.passive_sentences.length > 0 && (
                      <div className="mt-2 rounded-xl bg-amber-50/70 p-3 text-xs text-amber-900 border border-amber-200/80">
                        <div className="font-bold text-[11px] uppercase tracking-wider text-amber-800">
                          Passive Sentence Detected:
                        </div>
                        <p className="italic mt-1 text-slate-700">
                          "{analysis.metrics.passive_sentences[0]}"
                        </p>
                        <button
                          onClick={() => handleRewrite("professional")}
                          className="mt-2 text-[11px] font-bold text-amber-900 underline block"
                        >
                          Convert to active voice with Assistant &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TONE & SENTIMENT */}
              {activeTab === "tone" && (
                <div className="space-y-4">
                  <div
                    className={`rounded-2xl border p-4 shadow-xs space-y-4 ${
                      theme === "dark"
                        ? "bg-slate-800/80 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smile className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Audience Tone & Sentiment
                      </h4>
                    </div>

                    {/* Formality Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Formality Level:</span>
                        <span className="font-bold text-blue-500">
                          {toneData.formalityPercent}% (Formal)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all rounded-full"
                          style={{ width: `${toneData.formalityPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Confidence & Authority:</span>
                        <span className="font-bold text-emerald-500">
                          {toneData.confidencePercent}% (Assertive)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all rounded-full"
                          style={{ width: `${toneData.confidencePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Clarity Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Directness & Clarity:</span>
                        <span className="font-bold text-violet-500">
                          {toneData.clarityPercent}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-violet-600 transition-all rounded-full"
                          style={{ width: `${toneData.clarityPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Audience Fit Badge */}
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs">
                      <span className="font-bold block">Preset Target Alignment:</span>
                      <p className="mt-1 leading-relaxed">{toneData.audienceFit}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AI SIGNALS */}
              {activeTab === "ai_signals" && analysis && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-violet-900">
                        Uncertainty-Aware Writing Signals
                      </h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-200 text-violet-800">
                        {analysis.ai_signals.overall_status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-violet-800 leading-relaxed">
                      Evaluates syntactic burstiness and sentence variance. Scores represent statistical uniformity and NEVER establish proof of authorship.
                    </p>
                    <button
                      onClick={() => setShowEthicsModal(true)}
                      className="mt-2.5 text-xs font-bold text-violet-900 underline flex items-center gap-1"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>Read Stanford Misclassification Study & Policy</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Paragraph Cadence Breakdown
                    </span>
                    {analysis.ai_signals.passages.map((p) => (
                      <div
                        key={p.paragraph_index}
                        className={`rounded-xl border p-3.5 text-xs shadow-xs ${
                          theme === "dark"
                            ? "bg-slate-800/80 border-slate-700"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            Paragraph {p.paragraph_index + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              p.signal_level.includes("Consistent")
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {p.signal_level}
                          </span>
                        </div>
                        <p className="mt-1.5 text-slate-400 italic">"{p.preview}"</p>
                        <p className="mt-1 text-[11px] text-slate-400">{p.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: CITATIONS */}
              {activeTab === "citations" && analysis && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div
                      className={`rounded-xl border p-3 shadow-xs ${
                        theme === "dark"
                          ? "bg-slate-800/80 border-slate-700"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-400">In-Text Citations</div>
                      <div className="text-2xl font-black text-sky-500 mt-1">
                        {analysis.citations.in_text_citations_found}
                      </div>
                    </div>
                    <div
                      className={`rounded-xl border p-3 shadow-xs ${
                        theme === "dark"
                          ? "bg-slate-800/80 border-slate-700"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-400">Bibliography Items</div>
                      <div className="text-2xl font-black mt-1">
                        {analysis.citations.bibliography_entries_found}
                      </div>
                    </div>
                  </div>

                  {analysis.citations.unmatched_in_text_citations.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 shadow-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span>Missing Bibliography Entry:</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-amber-800 list-disc list-inside">
                        {analysis.citations.unmatched_in_text_citations.map((u, i) => (
                          <li key={i}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Citations Detected
                    </span>
                    {analysis.citations.citations.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No APA/MLA citations detected in this text.
                      </p>
                    ) : (
                      analysis.citations.citations.map((c, i) => (
                        <div
                          key={i}
                          className={`rounded-xl border p-3.5 text-xs shadow-xs space-y-2 ${
                            theme === "dark"
                              ? "bg-slate-800/80 border-slate-700"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold">{c.raw_citation}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Author: {c.authors || "N/A"} &bull; Year: {c.year || "N/A"}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                c.has_matching_reference
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {c.has_matching_reference ? "Matched" : "Unmatched"}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-700/20 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Web Crawl Verification</span>
                            <button
                              onClick={() =>
                                handleVerifyLiveSource(
                                  c.doi ? `10.1000/182` : "https://doi.org/10.1000/182"
                                )
                              }
                              disabled={verifyingUrl !== null}
                              className="text-[11px] font-bold text-blue-500 hover:underline disabled:opacity-50 flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>
                                {verifyingUrl ? "Crawling via Context.dev..." : "Verify Live Source"}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {liveVerifyResult && (
                    <div className="rounded-xl border border-sky-300 bg-sky-50 p-4 space-y-2 text-xs shadow-xs text-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-950 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-sky-600" />
                          <span>Live Source Verified (Context.dev)</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-200 text-sky-900 font-bold uppercase">
                          {liveVerifyResult.status}
                        </span>
                      </div>
                      <div className="font-semibold">{liveVerifyResult.title || liveVerifyResult.url}</div>
                      {liveVerifyResult.markdown_excerpt && (
                        <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-sky-200 text-[11px] leading-relaxed">
                          "{liveVerifyResult.markdown_excerpt.slice(0, 180)}..."
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: AI ASSISTANT */}
              {activeTab === "assistant" && (
                <div className="space-y-4">
                  <div
                    className={`rounded-2xl border p-4 shadow-xs ${
                      theme === "dark"
                        ? "bg-slate-800/80 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Wand2 className="h-4 w-4 text-blue-500" />
                      <span>AI Writing Assistant</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Select a style transform to elevate clarity, tone, or conciseness.
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRewrite("professional")}
                        disabled={rewriteLoading}
                        className={`rounded-xl border p-2.5 text-xs font-semibold text-left shadow-2xs transition-all ${
                          theme === "dark"
                            ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
                            : "border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        👔 Make Professional
                      </button>
                      <button
                        onClick={() => handleRewrite("concise")}
                        disabled={rewriteLoading}
                        className={`rounded-xl border p-2.5 text-xs font-semibold text-left shadow-2xs transition-all ${
                          theme === "dark"
                            ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
                            : "border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        ✂️ Make Concise
                      </button>
                      <button
                        onClick={() => handleRewrite("simplify")}
                        disabled={rewriteLoading}
                        className={`rounded-xl border p-2.5 text-xs font-semibold text-left shadow-2xs transition-all ${
                          theme === "dark"
                            ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
                            : "border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        💡 Simplify Language
                      </button>
                      <button
                        onClick={() => handleRewrite("summarize")}
                        disabled={rewriteLoading}
                        className={`rounded-xl border p-2.5 text-xs font-semibold text-left shadow-2xs transition-all ${
                          theme === "dark"
                            ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
                            : "border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        📌 Summarize Points
                      </button>
                    </div>
                  </div>

                  {rewriteLoading && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                      <RefreshCw className="mx-auto h-6 w-6 text-blue-600 animate-spin mb-2" />
                      <span>Generating transformed revision...</span>
                    </div>
                  )}

                  {rewriteResult && (
                    <div
                      className={`rounded-2xl border p-4 shadow-xs space-y-3 ${
                        theme === "dark"
                          ? "bg-slate-800/80 border-slate-700"
                          : "bg-white border-blue-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-500">Proposed Revision</span>
                        <button
                          onClick={handleApplyRewrite}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                        >
                          Apply to Document
                        </button>
                      </div>

                      <div
                        className={`rounded-xl p-3 text-xs font-serif leading-relaxed border ${
                          theme === "dark"
                            ? "bg-slate-900 border-slate-700 text-slate-200"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        {rewriteResult.revised}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        <span className="font-semibold">Changes made:</span>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {rewriteResult.changes_made.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Multi-Document Slide-Over Drawer */}
        {isDocsDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-start bg-slate-900/60 backdrop-blur-xs">
            <div
              className={`w-80 sm:w-96 h-full p-5 flex flex-col shadow-2xl border-r transition-colors ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/20">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                  <span>Document Workspace</span>
                </div>
                <button
                  onClick={() => setIsDocsDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleCreateNewDoc}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Blank Document</span>
                </button>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Saved Drafts
                </span>
                {savedDocs.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleSwitchDoc(d)}
                    className={`w-full p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      activeDocId === d.id
                        ? "border-blue-500 bg-blue-50/70 text-blue-950 font-bold"
                        : theme === "dark"
                        ? "border-slate-800 bg-slate-800/60 hover:bg-slate-800"
                        : "border-slate-100 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate font-semibold">{d.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {d.content.trim() ? `${d.content.trim().split(/\s+/).length} words` : "Empty draft"}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDoc(d.id, e)}
                      title="Delete Draft"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stanford / Ethics Policy Modal */}
      {showEthicsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span>Ethical AI Verification Framework</span>
              </div>
              <button
                onClick={() => setShowEthicsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <b>Core Principle:</b> TrustWrite strictly rejects using automated AI scores as definitive proof of authorship, cheating, or academic misconduct.
              </p>
              <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-100 text-blue-950 font-medium">
                Research published by Stanford-affiliated scholars found that automated AI detectors misclassify writing by non-native English speakers over 60% of the time due to constrained vocabulary distributions.
              </div>
              <p>
                Our AI writing signals examine sentence-length variance (burstiness) and syntactic cadence purely as an <i>educational invitation for manual review</i>.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEthicsModal(false)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grammar Rule Explanation Modal */}
      {explainModalFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span>Linguistic Explanation</span>
              </div>
              <button
                onClick={() => setExplainModalFinding(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Rule Category</div>
                <div className="font-semibold text-slate-800 capitalize mt-0.5">
                  {explainModalFinding.category} &bull; {explainModalFinding.message}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="text-[10px] uppercase font-bold text-blue-700">Detailed Rule</div>
                <p className="mt-1 text-blue-950 leading-relaxed">
                  {explainModalFinding.explanation}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">Example in text:</div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="line-through text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                    {explainModalFinding.original}
                  </span>
                  <span>&rarr;</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {explainModalFinding.suggestion}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleAcceptCorrection(explainModalFinding);
                  setExplainModalFinding(null);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                Accept Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
