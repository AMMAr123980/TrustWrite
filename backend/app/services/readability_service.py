import re
import math
from typing import List, Tuple
from app.schemas.analysis import ReadabilityMetrics

TRANSITION_WORDS = {
    "furthermore", "moreover", "however", "therefore", "consequently",
    "further", "additionally", "in addition", "as a result", "nevertheless",
    "nonetheless", "similarly", "likewise", "in contrast", "on the other hand",
    "for example", "for instance", "subsequently", "accordingly", "meanwhile",
    "hence", "thus", "overall", "specifically", "ultimately", "essentially"
}

PASSIVE_VOICE_REGEX = re.compile(
    r"\b(is|are|was|were|be|been|being)\s+([a-z]+ed|[a-z]+en|done|seen|made|written|given|taken|chosen|broken|known)\b",
    re.IGNORECASE
)

def count_syllables(word: str) -> int:
    word = word.lower().strip()
    if not word:
        return 0
    if len(word) <= 3:
        return 1
    
    # Remove common non-vowel suffixes
    word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
    word = re.sub(r'^y', '', word)
    matches = re.findall(r'[aeiouy]{1,2}', word)
    return max(1, len(matches))

class ReadabilityService:
    @staticmethod
    def split_sentences(text: str) -> List[str]:
        # Split on sentence boundaries, keeping non-empty stripped strings
        raw_sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'“])', text.strip())
        sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 0]
        if not sentences and text.strip():
            sentences = [text.strip()]
        return sentences

    @staticmethod
    def split_paragraphs(text: str) -> List[str]:
        paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
        return paragraphs if paragraphs else ([text.strip()] if text.strip() else [])

    @staticmethod
    def extract_words(text: str) -> List[str]:
        return [w for w in re.findall(r"\b[A-Za-z'-]+\b", text) if any(c.isalnum() for c in w)]

    @classmethod
    def calculate_metrics(cls, text: str) -> ReadabilityMetrics:
        clean_text = text.strip()
        if not clean_text:
            return ReadabilityMetrics(
                word_count=0,
                sentence_count=0,
                paragraph_count=0,
                char_count=0,
                avg_sentence_length=0.0,
                avg_word_length=0.0,
                flesch_reading_ease=100.0,
                flesch_reading_ease_label="N/A",
                flesch_kincaid_grade=0.0,
                gunning_fog_index=0.0,
                coleman_liau_index=0.0,
                automated_readability_index=0.0,
                passive_voice_count=0,
                passive_sentences=[],
                complex_word_count=0,
                complex_words=[],
                transition_word_count=0,
                reading_time_minutes=0.0
            )

        sentences = cls.split_sentences(clean_text)
        paragraphs = cls.split_paragraphs(clean_text)
        words = cls.extract_words(clean_text)

        word_count = len(words)
        sentence_count = max(1, len(sentences))
        paragraph_count = max(1, len(paragraphs))
        char_count = len(re.sub(r'\s', '', clean_text))

        syllable_counts = [count_syllables(w) for w in words]
        total_syllables = sum(syllable_counts)

        # Complex words (3+ syllables, excluding proper nouns/standard endings)
        complex_words = [w for w, count in zip(words, syllable_counts) if count >= 3]
        complex_word_count = len(complex_words)

        # Passive voice detection
        passive_sentences = []
        for s in sentences:
            if PASSIVE_VOICE_REGEX.search(s):
                passive_sentences.append(s)
        passive_voice_count = len(passive_sentences)

        # Transition words
        text_lower = clean_text.lower()
        transition_word_count = sum(1 for tw in TRANSITION_WORDS if re.search(r'\b' + re.escape(tw) + r'\b', text_lower))

        # Averages
        avg_sentence_length = round(word_count / sentence_count, 1) if word_count > 0 else 0.0
        avg_word_length = round(char_count / word_count, 1) if word_count > 0 else 0.0

        if word_count > 0:
            # Flesch Reading Ease
            fre = 206.835 - (1.015 * (word_count / sentence_count)) - (84.6 * (total_syllables / word_count))
            fre = max(0.0, min(100.0, round(fre, 1)))

            # Flesch-Kincaid Grade Level
            fkgl = (0.39 * (word_count / sentence_count)) + (11.8 * (total_syllables / word_count)) - 15.59
            fkgl = max(0.0, round(fkgl, 1))

            # Gunning Fog
            gunning_fog = 0.4 * ((word_count / sentence_count) + 100.0 * (complex_word_count / word_count))
            gunning_fog = max(0.0, round(gunning_fog, 1))

            # Coleman-Liau: L = avg letters per 100 words, S = avg sentences per 100 words
            L = (char_count / word_count) * 100
            S = (sentence_count / word_count) * 100
            cli = 0.0588 * L - 0.296 * S - 15.8
            cli = max(0.0, round(cli, 1))

            # ARI
            ari = 4.71 * (char_count / word_count) + 0.5 * (word_count / sentence_count) - 21.43
            ari = max(0.0, round(ari, 1))
        else:
            fre, fkgl, gunning_fog, cli, ari = 100.0, 0.0, 0.0, 0.0, 0.0

        # Labeling Flesch Reading Ease
        if fre >= 90:
            fre_label = "Very Easy (5th grade)"
        elif fre >= 80:
            fre_label = "Easy (6th grade)"
        elif fre >= 70:
            fre_label = "Fairly Easy (7th grade)"
        elif fre >= 60:
            fre_label = "Standard (8th & 9th grade)"
        elif fre >= 50:
            fre_label = "Fairly Difficult (10th-12th grade)"
        elif fre >= 30:
            fre_label = "Difficult (College)"
        else:
            fre_label = "Very Difficult (Postgraduate)"

        reading_time = round(word_count / 220.0, 1)

        return ReadabilityMetrics(
            word_count=word_count,
            sentence_count=sentence_count,
            paragraph_count=paragraph_count,
            char_count=char_count,
            avg_sentence_length=avg_sentence_length,
            avg_word_length=avg_word_length,
            flesch_reading_ease=fre,
            flesch_reading_ease_label=fre_label,
            flesch_kincaid_grade=fkgl,
            gunning_fog_index=gunning_fog,
            coleman_liau_index=cli,
            automated_readability_index=ari,
            passive_voice_count=passive_voice_count,
            passive_sentences=passive_sentences[:5], # top samples
            complex_word_count=complex_word_count,
            complex_words=list(set(complex_words))[:10],
            transition_word_count=transition_word_count,
            reading_time_minutes=reading_time
        )
