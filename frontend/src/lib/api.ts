const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface TextLocation {
  start: number;
  end: number;
  sentence_index?: number;
  paragraph_index?: number;
}

export interface WritingFinding {
  id: string;
  category: string;
  original: string;
  suggestion: string;
  message: string;
  explanation: string;
  location: TextLocation;
  confidence: string;
}

export interface ReadabilityMetrics {
  word_count: number;
  sentence_count: number;
  paragraph_count: number;
  char_count: number;
  avg_sentence_length: number;
  avg_word_length: number;
  flesch_reading_ease: number;
  flesch_reading_ease_label: string;
  flesch_kincaid_grade: number;
  gunning_fog_index: number;
  coleman_liau_index: number;
  automated_readability_index: number;
  passive_voice_count: number;
  passive_sentences: string[];
  complex_word_count: number;
  complex_words: string[];
  transition_word_count: number;
  reading_time_minutes: number;
}

export interface PassageSignal {
  paragraph_index: number;
  preview: string;
  signal_level: string;
  confidence_level: string;
  explanation: string;
  highlight_recommendation: boolean;
}

export interface AISignalReview {
  overall_status: string;
  overall_score: number;
  confidence_tier: string;
  disclaimer: string;
  passages: PassageSignal[];
  features_detected: string[];
}

export interface CitationItem {
  raw_citation: string;
  authors?: string;
  year?: string;
  has_matching_reference: boolean;
  doi?: string;
  is_doi_valid_format?: boolean;
}

export interface CitationReview {
  in_text_citations_found: number;
  bibliography_entries_found: number;
  citations: CitationItem[];
  unmatched_in_text_citations: string[];
  duplicate_references: string[];
  doi_validation_summary: Record<string, unknown>;
}

export interface WritingImprovementSuggestion {
  id: string;
  category: string;
  original: string;
  suggested: string;
  explanation: string;
  confidence: string;
}

export interface FullAnalysisResponse {
  analysis_id: string;
  status: string;
  overall_score: number;
  document_type: string;
  metrics: ReadabilityMetrics;
  grammar_findings: WritingFinding[];
  ai_signals: AISignalReview;
  citations: CitationReview;
  writing_suggestions: WritingImprovementSuggestion[];
}

export interface QuickRewriteResponse {
  original: string;
  revised: string;
  changes_made: string[];
  explanation: string;
}

export async function analyzeText(
  text: string,
  documentType: string = "general",
  checks: string[] = ["grammar", "readability", "ai_signals", "citations"]
): Promise<FullAnalysisResponse> {
  const res = await fetch(`${API_BASE}/analyses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      document_type: documentType,
      checks,
      external_provider_consent: true,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Analysis failed: ${errorText}`);
  }

  return res.json();
}

export async function rewriteText(
  text: string,
  instruction: string = "professional"
): Promise<QuickRewriteResponse> {
  const res = await fetch(`${API_BASE}/writing/rewrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, instruction }),
  });

  if (!res.ok) {
    throw new Error("Rewrite failed");
  }

  return res.json();
}

export function getPdfReportUrl(analysisId: string): string {
  return `${API_BASE}/reports/${analysisId}/pdf`;
}

export async function downloadDocx(title: string, content: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/export-docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    throw new Error("Failed to export Word document");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase() || "document";
  a.download = `${cleanTitle}.docx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export interface SourceVerificationResult {
  url: string;
  status: string;
  provider: string;
  exists: boolean;
  title: string;
  snippet: string;
  markdown_excerpt: string;
}

export async function verifySourceUrl(url: string): Promise<SourceVerificationResult> {
  const res = await fetch(`${API_BASE}/citations/verify-source`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    throw new Error("Failed to verify source URL");
  }

  return res.json();
}
