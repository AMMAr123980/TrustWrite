import math
import re
from typing import List
from app.schemas.analysis import AISignalReview, PassageSignal
from app.services.readability_service import ReadabilityService

DISCLAIMER_TEXT = (
    "Ethical Writing Indicator: AI writing pattern scores reflect statistical stylistic uniformity, "
    "such as low sentence-length variance and uniform token transitions. They DO NOT establish proof of authorship, "
    "cheating, or machine generation. Independent research (including Stanford studies) demonstrates that "
    "detectors can misclassify writing by non-native English speakers. Treat these findings solely as an invitation for manual review."
)

class AIDetectionService:
    @classmethod
    def evaluate_burstiness_and_perplexity(cls, text: str) -> AISignalReview:
        paragraphs = ReadabilityService.split_paragraphs(text)
        if not paragraphs:
            return AISignalReview(
                overall_status="Inconclusive Confidence",
                overall_score=0,
                confidence_tier="High Uncertainty",
                disclaimer=DISCLAIMER_TEXT,
                passages=[],
                features_detected=["Insufficient text to evaluate writing patterns (minimum 50 words recommended)"]
            )

        words_all = ReadabilityService.extract_words(text)
        if len(words_all) < 30:
            return AISignalReview(
                overall_status="Inconclusive Confidence",
                overall_score=20,
                confidence_tier="High Uncertainty",
                disclaimer=DISCLAIMER_TEXT,
                passages=[],
                features_detected=["Sample size is too brief for statistical confidence"]
            )

        passage_signals: List[PassageSignal] = []
        variation_scores = []
        features_detected = []

        for idx, para in enumerate(paragraphs):
            sentences = ReadabilityService.split_sentences(para)
            sent_lengths = [len(ReadabilityService.extract_words(s)) for s in sentences if s.strip()]
            
            if not sent_lengths:
                continue

            # Calculate sentence length variance (Burstiness)
            mean_len = sum(sent_lengths) / len(sent_lengths)
            variance = sum((l - mean_len) ** 2 for l in sent_lengths) / max(1, len(sent_lengths))
            std_dev = math.sqrt(variance)

            # High human writing typically has dynamic burstiness (varying short and long sentences, high std dev)
            # Machine generated text often has very uniform sentence lengths (std_dev < 3.0)
            preview = para[:120] + ("..." if len(para) > 120 else "")

            if len(sentences) >= 2 and std_dev < 3.2 and mean_len > 14:
                sig_level = "Pattern variation"
                conf = "Moderate"
                explanation = "Unusually uniform sentence length and structure across consecutive sentences."
                highlight = True
                variation_scores.append(65)
            elif std_dev >= 5.0 or len(sentences) <= 1:
                sig_level = "Consistent language patterns"
                conf = "High"
                explanation = "Natural variance in sentence pacing, clause complexity, and structure."
                highlight = False
                variation_scores.append(15)
            else:
                sig_level = "Consistent language patterns"
                conf = "Moderate"
                explanation = "Standard human stylistic pacing with varied transitions."
                highlight = False
                variation_scores.append(30)

            passage_signals.append(PassageSignal(
                paragraph_index=idx,
                preview=preview,
                signal_level=sig_level,
                confidence_level=conf,
                explanation=explanation,
                highlight_recommendation=highlight
            ))

        avg_score = int(sum(variation_scores) / max(1, len(variation_scores)))

        if avg_score > 55:
            status = "Mixed Signals (Review Suggested)"
            features_detected.append("Repetitive structural cadence across multiple paragraphs")
            features_detected.append("Low burstiness in sentence length distribution")
        elif avg_score > 35:
            status = "Consistent Language Patterns"
            features_detected.append("Balanced combination of short and structured sentences")
        else:
            status = "Consistent Language Patterns"
            features_detected.append("High structural variety and organic syntactic cadence")

        return AISignalReview(
            overall_status=status,
            overall_score=avg_score,
            confidence_tier="Educational Indicator",
            disclaimer=DISCLAIMER_TEXT,
            passages=passage_signals,
            features_detected=features_detected
        )
