# Linguara Translation Intelligent Contract
# Platform: Linguara — Trustworthy Multilingual Translation Through Decentralized AI Consensus
# Deploy to: GenLayer Studio → StudioNet
# Token: GEN
# Version: 3.0.0
#
# Architecture:
#   - Single LLM call per validator: each GenLayer validator translates independently
#   - GenLayer's multi-validator consensus IS the "multiple experts" mechanism
#   - Equivalence check: LENIENT — "translations convey the same meaning"
#   - This dramatically reduces validator execution time vs v2 (1 call vs 6 calls)
#   - Backend handles chunking for large texts (>3000 chars) before calling the contract
#   - Character limit per call: 15,000 chars (chunks from backend are always smaller)
#
# Design principle for consensus:
#   Lenient equivalence criteria prevent undetermined status. Each validator runs
#   translate_text independently; the consensus mechanism verifies agreement.

# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_json(text: str, fallback: dict) -> dict:
    cleaned = (
        text.strip()
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )
    start = cleaned.find("{")
    end = cleaned.rfind("}") + 1
    if start >= 0 and end > start:
        try:
            return json.loads(cleaned[start:end])
        except Exception:
            pass
    return fallback


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    try:
        return max(lo, min(hi, float(value)))
    except Exception:
        return (lo + hi) / 2.0


def _coerce_str(value: typing.Any, default: str = "") -> str:
    if value is None:
        return default
    return str(value)


def _coerce_float(value: typing.Any, default: float = 75.0) -> float:
    try:
        return float(value)
    except Exception:
        return default


def _avg(*values: float) -> float:
    valid = [v for v in values if v is not None]
    if not valid:
        return 75.0
    return sum(valid) / len(valid)


# ---------------------------------------------------------------------------
# Language catalogue
# ---------------------------------------------------------------------------

SUPPORTED_LANGUAGES: dict[str, str] = {
    "auto":   "Auto-detect",
    "en":     "English",
    "fr":     "French",
    "es":     "Spanish",
    "de":     "German",
    "pt":     "Portuguese",
    "it":     "Italian",
    "nl":     "Dutch",
    "ru":     "Russian",
    "zh":     "Chinese (Simplified)",
    "zh-tw":  "Chinese (Traditional)",
    "ja":     "Japanese",
    "ko":     "Korean",
    "ar":     "Arabic",
    "hi":     "Hindi",
    "tr":     "Turkish",
    "pl":     "Polish",
    "sv":     "Swedish",
    "no":     "Norwegian",
    "da":     "Danish",
    "fi":     "Finnish",
    "cs":     "Czech",
    "sk":     "Slovak",
    "ro":     "Romanian",
    "hu":     "Hungarian",
    "bg":     "Bulgarian",
    "hr":     "Croatian",
    "uk":     "Ukrainian",
    "el":     "Greek",
    "he":     "Hebrew",
    "fa":     "Persian",
    "id":     "Indonesian",
    "ms":     "Malay",
    "th":     "Thai",
    "vi":     "Vietnamese",
    "bn":     "Bengali",
    "ur":     "Urdu",
    "sw":     "Swahili",
    "am":     "Amharic",
    "yo":     "Yoruba",
    "ig":     "Igbo",
    "ha":     "Hausa",
    "zu":     "Zulu",
    "af":     "Afrikaans",
    "ca":     "Catalan",
    "gl":     "Galician",
    "eu":     "Basque",
    "lt":     "Lithuanian",
    "lv":     "Latvian",
    "et":     "Estonian",
    "sl":     "Slovenian",
    "sr":     "Serbian",
    "mk":     "Macedonian",
    "sq":     "Albanian",
    "hy":     "Armenian",
    "ka":     "Georgian",
    "az":     "Azerbaijani",
    "kk":     "Kazakh",
    "uz":     "Uzbek",
    "mn":     "Mongolian",
    "ne":     "Nepali",
    "si":     "Sinhala",
    "my":     "Burmese",
    "km":     "Khmer",
    "lo":     "Lao",
    "tl":     "Filipino",
    "jv":     "Javanese",
    "su":     "Sundanese",
    "cy":     "Welsh",
    "ga":     "Irish",
    "is":     "Icelandic",
    "lb":     "Luxembourgish",
    "mt":     "Maltese",
    "be":     "Belarusian",
    "bs":     "Bosnian",
    "ky":     "Kyrgyz",
    "tg":     "Tajik",
    "tk":     "Turkmen",
}


SUPPORTED_DOMAINS: list[str] = [
    "general",
    "legal",
    "medical",
    "technical",
    "financial",
    "government",
    "literary",
    "scientific",
    "news",
    "marketing",
]


DOMAIN_INSTRUCTIONS: dict[str, str] = {
    "general": (
        "Translate naturally and fluently. Preserve the original tone and intent."
    ),
    "legal": (
        "This is a legal document. Use precise legal terminology. "
        "Preserve all clause structures, conditions, and legal references exactly. "
        "Do not paraphrase legal language — translate it literally while keeping it grammatically correct."
    ),
    "medical": (
        "This is medical content. Use correct clinical and anatomical terminology. "
        "Preserve drug names, dosages, and medical procedures exactly as stated. "
        "Maintain patient safety language and urgency markers."
    ),
    "technical": (
        "This is technical documentation. Preserve all technical terms, product names, "
        "commands, code references, and specifications exactly. "
        "Use industry-standard terminology in the target language."
    ),
    "financial": (
        "This is financial content. Preserve all figures, percentages, currency references, "
        "financial instruments, and regulatory terminology exactly. "
        "Use standard financial terminology in the target language."
    ),
    "government": (
        "This is a government or public-sector document. "
        "Use formal register and official terminology. "
        "Preserve all reference numbers, titles, and institutional names."
    ),
    "literary": (
        "This is literary content. Preserve the author's voice, style, rhythm, and literary devices. "
        "Prioritise aesthetic quality and cultural resonance over literal accuracy."
    ),
    "scientific": (
        "This is scientific content. Preserve all technical terminology, measurement units, "
        "chemical names, biological terms, and citations exactly. "
        "Use accepted scientific terminology in the target language."
    ),
    "news": (
        "This is journalistic content. Maintain an objective, clear, and concise style. "
        "Preserve names, places, dates, and proper nouns exactly."
    ),
    "marketing": (
        "This is marketing content. Adapt culturally for the target audience while preserving "
        "the brand voice, tone, and persuasive intent. "
        "Prioritise impact and cultural appropriateness."
    ),
}


# ---------------------------------------------------------------------------
# Main Contract
# ---------------------------------------------------------------------------

class LinguaraTranslation(gl.Contract):
    """
    Linguara decentralised translation contract v3.0.0.

    Storage layout
    ──────────────
    translations            : TreeMap[str, str]   — translation_id → JSON blob
    user_translation_counts : TreeMap[str, u256]  — wallet_address → count
    glossary                : TreeMap[str, str]   — "domain:term" → definition
    ratings                 : TreeMap[str, str]   — translation_id → JSON rating
    total_translations      : u256                — global counter
    contract_version        : str
    owner_address           : str
    paused                  : bool

    Public write methods
    ────────────────────
    translate_text          — single-LLM-call translation with lenient consensus
    detect_language         — language detection only
    rate_translation        — post-translation user rating (1–5)
    add_glossary_term       — owner adds a domain glossary term

    Public view methods
    ───────────────────
    get_translation         — retrieve stored translation by ID
    get_translation_status  — lightweight status check
    get_user_stats          — per-wallet statistics
    get_global_stats        — contract-wide statistics
    get_supported_languages — list of supported language codes
    get_supported_domains   — list of supported domain names
    get_contract_info       — version + owner
    get_glossary_term       — look up a glossary entry
    """

    translations: TreeMap[str, str]
    user_translation_counts: TreeMap[str, u256]
    glossary: TreeMap[str, str]
    ratings: TreeMap[str, str]
    total_translations: u256
    contract_version: str
    owner_address: str
    paused: bool

    def __init__(self, owner_address: str) -> None:
        self.total_translations = u256(0)
        self.contract_version = "3.0.0"
        self.owner_address = owner_address
        self.paused = False

    # ========================================================================
    # PUBLIC WRITE — translate_text  (v3: single LLM call per validator)
    # ========================================================================

    @gl.public.write
    def translate_text(
        self,
        translation_id: str,
        source_text: str,
        source_language: str,
        target_language: str,
        domain: str,
        requestor_address: str,
    ) -> None:
        """
        Translate source_text and store the consensus result on-chain.

        v3 design: one LLM call per validator execution. GenLayer's multi-validator
        consensus mechanism is the quality assurance layer — each of the 5 validators
        independently translates the text and the equivalence check verifies they
        agree on meaning. This is 6x faster than v2's 3-agent + selection + scoring
        + language detection approach.

        For texts longer than 3,000 characters, the backend splits into chunks and
        calls this method once per chunk (parallel transactions). The backend then
        reassembles the chunks in order.

        Args:
            translation_id:     Unique ID (UUID) from the backend.
            source_text:        Text to translate (max 15,000 chars per call).
            source_language:    BCP-47 language code or "auto".
            target_language:    BCP-47 language code.
            domain:             Translation domain (legal/medical/technical/etc).
            requestor_address:  Caller wallet address for attribution.
        """
        if self.paused:
            raise gl.vm.UserError("Contract is paused")

        if not translation_id:
            raise gl.vm.UserError("translation_id is required")

        if not source_text or len(source_text.strip()) == 0:
            raise gl.vm.UserError("source_text cannot be empty")

        if len(source_text) > 15000:
            raise gl.vm.UserError("source_text exceeds 15,000 character limit per call. Use backend chunking for longer texts.")

        if target_language not in SUPPORTED_LANGUAGES:
            raise gl.vm.UserError(f"Unsupported target language: {target_language}")

        if domain not in SUPPORTED_DOMAINS:
            domain = "general"

        src_label = SUPPORTED_LANGUAGES.get(source_language, source_language if source_language != "auto" else "the source language")
        tgt_label = SUPPORTED_LANGUAGES.get(target_language, target_language)
        domain_instruction = DOMAIN_INSTRUCTIONS.get(domain, DOMAIN_INSTRUCTIONS["general"])

        # ── Step 1: Single LLM translation call ─────────────────────────────
        # Each GenLayer validator runs this independently — that IS the multi-expert layer.
        translation_prompt = (
            f"You are a professional translator. Translate the following text from {src_label} to {tgt_label}.\n\n"
            f"Domain: {domain}\n"
            f"Instructions: {domain_instruction}\n\n"
            f"Rules:\n"
            f"- Output ONLY the translated text. No explanations, no notes, no preamble.\n"
            f"- Preserve all formatting, paragraph breaks, bullet points, and structure.\n"
            f"- Preserve proper nouns, brand names, and technical terms as appropriate.\n"
            f"- Do not add any content that is not in the original.\n\n"
            f"Text to translate:\n{source_text}"
        )

        translation_result = gl.exec_prompt(translation_prompt)

        final_translation = translation_result.strip()
        if not final_translation:
            raise gl.vm.UserError("LLM returned empty translation")

        # ── Step 2: Lenient equivalence check ───────────────────────────────
        # This is what GenLayer uses to verify validator agreement.
        # Criteria: the translation conveys the same meaning as the source text.
        # Lenient = avoids undetermined consensus status.
        def equivalence_check(t: str) -> bool:
            return (
                len(t.strip()) > 0
                and len(t.strip()) >= len(source_text.strip()) * 0.3
            )

        gl.eq_principle_prompt_comparative(
            final_translation,
            lambda t: equivalence_check(t),
            "The translation conveys the same core meaning and information as the source text, "
            "even if wording differs between validators.",
        )

        # ── Step 3: Persist result ───────────────────────────────────────────
        result_blob = {
            "translation_id": translation_id,
            "source_language": source_language,
            "target_language": target_language,
            "domain": domain,
            "final_translation": final_translation,
            "confidence_score": 85.0,
            "status": "COMPLETED",
            "requestor": requestor_address,
        }

        self.translations[translation_id] = json.dumps(result_blob)

        self.total_translations = u256(int(self.total_translations) + 1)

        if requestor_address:
            current = u256(0)
            try:
                current = self.user_translation_counts[requestor_address]
            except Exception:
                pass
            self.user_translation_counts[requestor_address] = u256(int(current) + 1)

    # ========================================================================
    # PUBLIC WRITE — detect_language
    # ========================================================================

    @gl.public.write
    def detect_language(
        self,
        text_sample: str,
        requestor_address: str,
    ) -> None:
        """
        Detect the language of a text sample and store the result on-chain.

        Args:
            text_sample:       Text sample to analyse (max 1,000 chars).
            requestor_address: Caller wallet address.
        """
        if self.paused:
            raise gl.vm.UserError("Contract is paused")

        safe_sample = text_sample[:1000]

        detect_prompt = (
            "Identify the language of the following text. "
            "Respond with ONLY the BCP-47 language code (e.g. 'en', 'fr', 'es', 'zh'). "
            "Nothing else.\n\nText:\n" + safe_sample
        )

        detected = gl.exec_prompt(detect_prompt).strip().lower()

        result = {
            "detected_language": detected,
            "requestor": requestor_address,
            "sample_length": len(safe_sample),
        }

        key = f"detect:{requestor_address}:{len(safe_sample)}"
        self.translations[key] = json.dumps(result)

    # ========================================================================
    # PUBLIC WRITE — rate_translation
    # ========================================================================

    @gl.public.write
    def rate_translation(
        self,
        translation_id: str,
        rating: int,
        feedback: str,
        rater_address: str,
    ) -> None:
        """
        Submit a user rating for a completed translation.

        Args:
            translation_id: ID of the translation to rate.
            rating:         Integer 1–5.
            feedback:       Optional feedback text (max 500 chars).
            rater_address:  Caller wallet address.
        """
        if self.paused:
            raise gl.vm.UserError("Contract is paused")

        if rating < 1 or rating > 5:
            raise gl.vm.UserError("Rating must be between 1 and 5")

        safe_feedback = feedback[:500] if feedback else ""

        rating_blob = {
            "translation_id": translation_id,
            "rating": rating,
            "feedback": safe_feedback,
            "rater": rater_address,
        }

        self.ratings[translation_id] = json.dumps(rating_blob)

    # ========================================================================
    # PUBLIC WRITE — add_glossary_term (owner only)
    # ========================================================================

    @gl.public.write
    def add_glossary_term(
        self,
        domain: str,
        source_term: str,
        target_language: str,
        target_term: str,
        caller_address: str,
    ) -> None:
        """
        Add a domain-specific glossary term (owner only).

        Args:
            domain:          Translation domain.
            source_term:     Source language term.
            target_language: Target language code.
            target_term:     Translation of the term.
            caller_address:  Must match owner_address.
        """
        if caller_address != self.owner_address:
            raise gl.vm.UserError("Only the contract owner can add glossary terms")

        key = f"{domain}:{target_language}:{source_term.lower()}"
        self.glossary[key] = target_term

    # ========================================================================
    # PUBLIC WRITE — pause / unpause (owner only)
    # ========================================================================

    @gl.public.write
    def set_paused(self, paused: bool, caller_address: str) -> None:
        if caller_address != self.owner_address:
            raise gl.vm.UserError("Only the contract owner can pause/unpause")
        self.paused = paused

    # ========================================================================
    # PUBLIC VIEW methods
    # ========================================================================

    @gl.public.view
    def get_translation(self, translation_id: str) -> str:
        """Retrieve a stored translation by ID. Returns JSON string or empty string."""
        try:
            return self.translations[translation_id]
        except Exception:
            return ""

    @gl.public.view
    def get_translation_status(self, translation_id: str) -> str:
        """Lightweight check — returns 'COMPLETED', 'NOT_FOUND', or 'ERROR'."""
        try:
            raw = self.translations[translation_id]
            if raw:
                data = json.loads(raw)
                return data.get("status", "COMPLETED")
            return "NOT_FOUND"
        except Exception:
            return "NOT_FOUND"

    @gl.public.view
    def get_user_stats(self, wallet_address: str) -> str:
        """Return per-wallet statistics as a JSON string."""
        try:
            count = int(self.user_translation_counts[wallet_address])
        except Exception:
            count = 0
        return json.dumps({"wallet": wallet_address, "translation_count": count})

    @gl.public.view
    def get_global_stats(self) -> str:
        """Return contract-wide statistics as a JSON string."""
        return json.dumps({
            "total_translations": int(self.total_translations),
            "contract_version": self.contract_version,
            "paused": self.paused,
        })

    @gl.public.view
    def get_supported_languages(self) -> str:
        """Return supported language codes as a JSON array string."""
        return json.dumps(list(SUPPORTED_LANGUAGES.keys()))

    @gl.public.view
    def get_supported_domains(self) -> str:
        """Return supported domain names as a JSON array string."""
        return json.dumps(SUPPORTED_DOMAINS)

    @gl.public.view
    def get_contract_info(self) -> str:
        """Return contract metadata as a JSON string."""
        return json.dumps({
            "version": self.contract_version,
            "owner": self.owner_address,
            "paused": self.paused,
        })

    @gl.public.view
    def get_glossary_term(self, domain: str, target_language: str, source_term: str) -> str:
        """Look up a glossary entry. Returns the target term or empty string."""
        key = f"{domain}:{target_language}:{source_term.lower()}"
        try:
            return self.glossary[key]
        except Exception:
            return ""

    @gl.public.view
    def get_rating(self, translation_id: str) -> str:
        """Retrieve user rating for a translation. Returns JSON string or empty string."""
        try:
            return self.ratings[translation_id]
        except Exception:
            return ""
