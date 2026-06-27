# Linguara Translation Intelligent Contract
# Platform: Linguara — Trustworthy Multilingual Translation Through Decentralized AI Consensus
# Deploy to: GenLayer Studio → StudioNet
# Version: 3.3.0
#
# Architecture:
#   - Single LLM call per validator via gl.nondet.exec_prompt()
#   - GenLayer's 5-validator consensus IS the multi-expert quality layer
#   - gl.eq_principle.prompt_comparative() verifies validators agree on meaning
#   - Backend handles chunking for texts >3,000 chars (parallel txs, reassembled)
#   - Character limit: 15,000 chars per contract call
#
# Design principle:
#   v2 ran 6 LLM calls per validator (3 agents + selection + scoring + detection)
#   = 30 LLM calls total → validators timed out on long texts.
#   v3 runs 1 LLM call per validator = 5 total, dramatically faster finalization.
#   GenLayer's multi-validator consensus replaces the multi-agent approach.

# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


# ---------------------------------------------------------------------------
# Language catalogue
# ---------------------------------------------------------------------------

SUPPORTED_LANGUAGES: dict = {
    "auto":  "Auto-detect",
    "en":    "English",
    "fr":    "French",
    "es":    "Spanish",
    "de":    "German",
    "pt":    "Portuguese",
    "it":    "Italian",
    "nl":    "Dutch",
    "ru":    "Russian",
    "zh":    "Chinese (Simplified)",
    "zh-tw": "Chinese (Traditional)",
    "ja":    "Japanese",
    "ko":    "Korean",
    "ar":    "Arabic",
    "hi":    "Hindi",
    "tr":    "Turkish",
    "pl":    "Polish",
    "sv":    "Swedish",
    "no":    "Norwegian",
    "da":    "Danish",
    "fi":    "Finnish",
    "cs":    "Czech",
    "sk":    "Slovak",
    "ro":    "Romanian",
    "hu":    "Hungarian",
    "bg":    "Bulgarian",
    "hr":    "Croatian",
    "uk":    "Ukrainian",
    "el":    "Greek",
    "he":    "Hebrew",
    "fa":    "Persian",
    "id":    "Indonesian",
    "ms":    "Malay",
    "th":    "Thai",
    "vi":    "Vietnamese",
    "bn":    "Bengali",
    "ur":    "Urdu",
    "sw":    "Swahili",
    "am":    "Amharic",
    "yo":    "Yoruba",
    "ig":    "Igbo",
    "ha":    "Hausa",
    "zu":    "Zulu",
    "af":    "Afrikaans",
    "ca":    "Catalan",
    "gl":    "Galician",
    "eu":    "Basque",
    "lt":    "Lithuanian",
    "lv":    "Latvian",
    "et":    "Estonian",
    "sl":    "Slovenian",
    "sr":    "Serbian",
    "mk":    "Macedonian",
    "sq":    "Albanian",
    "hy":    "Armenian",
    "ka":    "Georgian",
    "az":    "Azerbaijani",
    "kk":    "Kazakh",
    "uz":    "Uzbek",
    "mn":    "Mongolian",
    "ne":    "Nepali",
    "si":    "Sinhala",
    "my":    "Burmese",
    "km":    "Khmer",
    "lo":    "Lao",
    "tl":    "Filipino",
    "jv":    "Javanese",
    "cy":    "Welsh",
    "ga":    "Irish",
    "is":    "Icelandic",
    "lb":    "Luxembourgish",
    "mt":    "Maltese",
    "be":    "Belarusian",
    "bs":    "Bosnian",
    "ky":    "Kyrgyz",
    "tg":    "Tajik",
    "tk":    "Turkmen",
}


# ---------------------------------------------------------------------------
# Domain catalogue
# ---------------------------------------------------------------------------

SUPPORTED_DOMAINS: list = [
    "general", "legal", "medical", "technical", "financial",
    "government", "literary", "scientific", "news", "marketing",
]

DOMAIN_INSTRUCTIONS: dict = {
    "general": (
        "Translate naturally and fluently. Preserve the original tone and intent."
    ),
    "legal": (
        "This is a legal document. Use precise legal terminology. "
        "Preserve all clause structures, conditions, and legal references exactly. "
        "Do not paraphrase legal language — translate it literally while keeping "
        "it grammatically correct in the target language."
    ),
    "medical": (
        "This is medical content. Use correct clinical and anatomical terminology. "
        "Preserve drug names, dosages, and medical procedures exactly as stated. "
        "Maintain patient safety language and urgency markers."
    ),
    "technical": (
        "This is technical documentation. Preserve all technical terms, product "
        "names, commands, code references, and specifications exactly. "
        "Use industry-standard terminology in the target language."
    ),
    "financial": (
        "This is financial content. Preserve all figures, percentages, currency "
        "references, financial instruments, and regulatory terminology exactly. "
        "Use standard financial terminology in the target language."
    ),
    "government": (
        "This is a government or public-sector document. "
        "Use formal register and official terminology. "
        "Preserve all reference numbers, titles, and institutional names."
    ),
    "literary": (
        "This is literary content. Preserve the author's voice, style, rhythm, "
        "and literary devices. Prioritise aesthetic quality and cultural resonance "
        "over literal accuracy."
    ),
    "scientific": (
        "This is scientific content. Preserve all technical terminology, "
        "measurement units, chemical names, biological terms, and citations exactly. "
        "Use accepted scientific terminology in the target language."
    ),
    "news": (
        "This is journalistic content. Maintain an objective, clear, and concise "
        "style. Preserve names, places, dates, and proper nouns exactly."
    ),
    "marketing": (
        "This is marketing content. Adapt culturally for the target audience while "
        "preserving the brand voice, tone, and persuasive intent. "
        "Prioritise impact and cultural appropriateness."
    ),
}

# Valid tone values for translate_with_context
VALID_TONES: list = [
    "formal", "informal", "neutral", "technical", "friendly", "professional",
]


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    try:
        return max(lo, min(hi, float(value)))
    except Exception:
        return (lo + hi) / 2.0


def _safe_json(text: str, fallback: dict) -> dict:
    cleaned = text.strip().replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}") + 1
    if start >= 0 and end > start:
        try:
            return json.loads(cleaned[start:end])
        except Exception:
            pass
    return fallback


# ---------------------------------------------------------------------------
# Main Contract
# ---------------------------------------------------------------------------

class LinguaraTranslation(gl.Contract):
    """
    Linguara decentralised translation contract v3.2.0.

    Storage layout
    ──────────────
    translations            : TreeMap[str, str]   — translation_id → JSON blob
    user_translation_counts : TreeMap[str, u256]  — wallet_address → count
    glossary                : TreeMap[str, str]   — "domain:lang:term" → target term
    ratings                 : TreeMap[str, str]   — translation_id → JSON rating
    total_translations      : u256                — global counter
    contract_version        : str
    owner_address           : str
    paused                  : bool

    Public write methods
    ────────────────────
    translate_text          — core translation (1 LLM call, lenient consensus)
    translate_with_context  — translation with tone + context notes
    detect_language         — language detection only
    rate_translation        — post-translation user rating (1–5 stars)
    add_glossary_term       — owner adds a domain-specific glossary entry
    set_paused              — owner emergency pause/unpause

    Public view methods
    ───────────────────
    get_translation         — retrieve stored translation JSON by ID
    get_translation_status  — lightweight status check
    get_user_stats          — per-wallet translation count
    get_global_stats        — contract-wide statistics
    get_supported_languages — full language code catalogue
    get_supported_domains   — supported domain list
    get_contract_info       — version + owner + pause state
    get_glossary_term       — look up a glossary entry
    get_rating              — retrieve a user rating
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
        """
        Deploy the Linguara translation contract.

        Args:
            owner_address: Hex address of the contract owner/deployer.
        """
        self.total_translations = u256(0)
        self.contract_version = "3.3.0"
        self.owner_address = owner_address
        self.paused = False

    # =========================================================================
    # PUBLIC WRITE — translate_text
    # =========================================================================

    @gl.public.write
    def translate_text(
        self,
        translation_id: str,
        source_text: str,
        source_language: str,
        target_language: str,
        domain: str,
        requestor_address: str,
        glossary_json: str = '[]',
    ) -> None:
        """
        Translate source_text and store the consensus result on-chain.

        Single LLM call per validator (gl.nondet.exec_prompt). GenLayer's
        5-validator network independently translates the text; the
        prompt_comparative equivalence principle verifies they agree on
        meaning before the transaction is accepted.

        For texts > 3,000 characters the backend splits into paragraph chunks
        and calls this method once per chunk (concurrent transactions). The
        backend reassembles chunks in order before saving to the database.

        Args:
            translation_id:    Unique UUID from backend, or uuid__chunk_N for chunks.
            source_text:       Text to translate. Max 15,000 chars per call.
            source_language:   BCP-47 code or "auto" for auto-detection.
            target_language:   BCP-47 code (must be in SUPPORTED_LANGUAGES).
            domain:            Translation domain — legal/medical/technical/etc.
            requestor_address: Caller wallet address for on-chain attribution.
            glossary_json:     JSON array of {src, tgt} term pairs from user glossary.
        """
        if self.paused:
            raise Exception("Contract is paused")
        if not translation_id:
            raise Exception("translation_id is required")
        if not source_text or not source_text.strip():
            raise Exception("source_text cannot be empty")
        if len(source_text) > 15000:
            raise Exception(
                "source_text exceeds 15,000 character limit. "
                "Use backend chunking for longer texts."
            )

        if domain not in SUPPORTED_DOMAINS:
            domain = "general"

        src_label = SUPPORTED_LANGUAGES.get(
            source_language,
            source_language if source_language != "auto" else "the source language",
        )
        tgt_label = SUPPORTED_LANGUAGES.get(target_language, target_language)
        domain_instruction = DOMAIN_INSTRUCTIONS.get(domain, DOMAIN_INSTRUCTIONS["general"])

        # Build optional glossary block
        glossary_block = ""
        try:
            terms = json.loads(glossary_json) if glossary_json else []
            if terms:
                lines = "\n".join(f'  - "{t["src"]}" → "{t["tgt"]}"' for t in terms if "src" in t and "tgt" in t)
                glossary_block = (
                    f"\nUser-defined glossary (you MUST use these exact translations for the listed terms):\n"
                    f"{lines}\n"
                )
        except Exception:
            glossary_block = ""

        prompt = (
            f"You are a professional translator. "
            f"Translate the following text from {src_label} to {tgt_label}.\n\n"
            f"Domain: {domain}\n"
            f"Instructions: {domain_instruction}\n"
            f"{glossary_block}\n"
            f"Rules:\n"
            f"- Output ONLY the translated text. No explanations, no notes, no preamble.\n"
            f"- Preserve all formatting, paragraph breaks, bullet points, and structure.\n"
            f"- Preserve proper nouns, brand names, and technical terms as appropriate.\n"
            f"- Do not add any content that is not present in the original.\n\n"
            f"Text to translate:\n{source_text}"
        )

        def do_translate():
            return gl.nondet.exec_prompt(prompt)

        final_translation = gl.eq_principle.prompt_comparative(
            do_translate,
            "The translations convey the same core meaning and information, "
            "even if they use different wording or phrasing.",
        )

        self._store_result(
            translation_id=translation_id,
            source_language=source_language,
            target_language=target_language,
            domain=domain,
            final_translation=str(final_translation).strip(),
            requestor_address=requestor_address,
            tone=None,
        )

    # =========================================================================
    # PUBLIC WRITE — translate_with_context
    # =========================================================================

    @gl.public.write
    def translate_with_context(
        self,
        translation_id: str,
        source_text: str,
        source_language: str,
        target_language: str,
        domain: str,
        requestor_address: str,
        context_notes: str,
        tone: str,
    ) -> None:
        """
        Extended translation with tone control and optional context notes.

        Identical to translate_text but enriches the prompt with:
          - context_notes: background about the document or target audience
          - tone:          desired register (formal/informal/neutral/technical/
                           friendly/professional)

        Args:
            translation_id:    Unique ID from backend.
            source_text:       Text to translate. Max 15,000 chars per call.
            source_language:   BCP-47 code or "auto".
            target_language:   BCP-47 code.
            domain:            Translation domain.
            requestor_address: Caller wallet address.
            context_notes:     Background context (max 1,000 chars used).
            tone:              Desired register.
        """
        if self.paused:
            raise Exception("Contract is paused")
        if not translation_id:
            raise Exception("translation_id is required")
        if not source_text or not source_text.strip():
            raise Exception("source_text cannot be empty")
        if len(source_text) > 15000:
            raise Exception(
                "source_text exceeds 15,000 character limit. "
                "Use backend chunking for longer texts."
            )

        if domain not in SUPPORTED_DOMAINS:
            domain = "general"
        if tone not in VALID_TONES:
            tone = "neutral"

        src_label = SUPPORTED_LANGUAGES.get(
            source_language,
            source_language if source_language != "auto" else "the source language",
        )
        tgt_label = SUPPORTED_LANGUAGES.get(target_language, target_language)
        domain_instruction = DOMAIN_INSTRUCTIONS.get(domain, DOMAIN_INSTRUCTIONS["general"])

        safe_context = context_notes[:1000] if context_notes else ""
        context_block = (
            f"\nAdditional context provided by the client:\n{safe_context}\n"
            if safe_context else ""
        )

        prompt = (
            f"You are a professional translator. "
            f"Translate the following text from {src_label} to {tgt_label}.\n\n"
            f"Domain: {domain}\n"
            f"Instructions: {domain_instruction}\n"
            f"Tone requirement: Use a {tone} register throughout the translation.\n"
            f"{context_block}\n"
            f"Rules:\n"
            f"- Output ONLY the translated text. No explanations, no notes, no preamble.\n"
            f"- Preserve all formatting, paragraph breaks, bullet points, and structure.\n"
            f"- Preserve proper nouns, brand names, and technical terms as appropriate.\n"
            f"- Do not add any content that is not present in the original.\n\n"
            f"Text to translate:\n{source_text}"
        )

        def do_translate():
            return gl.nondet.exec_prompt(prompt)

        final_translation = gl.eq_principle.prompt_comparative(
            do_translate,
            "The translations convey the same core meaning and information "
            "with the requested tone, even if they use different wording.",
        )

        self._store_result(
            translation_id=translation_id,
            source_language=source_language,
            target_language=target_language,
            domain=domain,
            final_translation=str(final_translation).strip(),
            requestor_address=requestor_address,
            tone=tone,
        )

    # =========================================================================
    # PUBLIC WRITE — detect_language
    # =========================================================================

    @gl.public.write
    def detect_language(
        self,
        detection_id: str,
        text_sample: str,
        requestor_address: str,
    ) -> None:
        """
        Detect the language of a text sample and store the result on-chain.

        Args:
            detection_id:      Unique ID for this detection request.
            text_sample:       Text to analyse (max 1,000 chars used).
            requestor_address: Caller wallet address.
        """
        if self.paused:
            raise Exception("Contract is paused")

        safe_sample = text_sample[:1000]

        prompt = (
            "Identify the language of the following text. "
            "Respond with ONLY the BCP-47 language code "
            "(e.g. 'en', 'fr', 'es', 'zh', 'ar'). Nothing else.\n\n"
            f"Text:\n{safe_sample}"
        )

        def do_detect():
            return gl.nondet.exec_prompt(prompt)

        detected = gl.eq_principle.prompt_comparative(
            do_detect,
            "The detected language code identifies the same language.",
        )

        self.translations[f"detect:{detection_id}"] = json.dumps({
            "detection_id": detection_id,
            "detected_language": str(detected).strip().lower(),
            "requestor": requestor_address,
            "sample_length": len(safe_sample),
        })

    # =========================================================================
    # PUBLIC WRITE — rate_translation
    # =========================================================================

    @gl.public.write
    def rate_translation(
        self,
        translation_id: str,
        rating: int,
        feedback: str,
        rater_address: str,
    ) -> None:
        """
        Submit a user rating (1–5 stars) for a completed translation.

        Args:
            translation_id: ID of the translation to rate.
            rating:         Integer 1–5.
            feedback:       Optional free-text feedback (max 500 chars used).
            rater_address:  Caller wallet address.
        """
        if rating < 1 or rating > 5:
            raise Exception("Rating must be between 1 and 5")

        safe_feedback = feedback[:500] if feedback else ""

        self.ratings[translation_id] = json.dumps({
            "translation_id": translation_id,
            "rating": rating,
            "feedback": safe_feedback,
            "rater": rater_address,
        })

    # =========================================================================
    # PUBLIC WRITE — add_glossary_term  (owner only)
    # =========================================================================

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
        Add a domain-specific glossary entry (owner only).

        Glossary terms are stored separately from translations and can be
        used by clients to instruct translators on preferred terminology.

        Args:
            domain:          Translation domain.
            source_term:     Source-language term to define.
            target_language: Target language code.
            target_term:     Preferred translation of the term.
            caller_address:  Must match owner_address.
        """
        if caller_address != self.owner_address:
            raise Exception("Only the contract owner can add glossary terms")

        key = f"{domain}:{target_language}:{source_term.lower().strip()}"
        self.glossary[key] = target_term

    # =========================================================================
    # PUBLIC WRITE — set_paused  (owner only)
    # =========================================================================

    @gl.public.write
    def set_paused(self, paused: bool, caller_address: str) -> None:
        """
        Emergency pause or unpause the contract (owner only).

        When paused, all translate_* and detect_language calls revert.
        View methods remain available.

        Args:
            paused:         True to pause, False to unpause.
            caller_address: Must match owner_address.
        """
        if caller_address != self.owner_address:
            raise Exception("Only the contract owner can pause or unpause the contract")
        self.paused = paused

    # =========================================================================
    # PUBLIC VIEW methods
    # =========================================================================

    @gl.public.view
    def get_translation(self, translation_id: str) -> str:
        """
        Retrieve a stored translation by ID.

        Returns:
            JSON string with translation data, or empty string if not found.
        """
        try:
            return self.translations[translation_id]
        except Exception:
            return ""

    @gl.public.view
    def get_translation_status(self, translation_id: str) -> str:
        """
        Lightweight status check for a translation ID.

        Returns:
            'COMPLETED', 'NOT_FOUND', or the stored status string.
        """
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
        """
        Return per-wallet translation statistics.

        Returns:
            JSON string: {"wallet": "0x...", "translation_count": N}
        """
        try:
            count = int(self.user_translation_counts[wallet_address])
        except Exception:
            count = 0
        return json.dumps({"wallet": wallet_address, "translation_count": count})

    @gl.public.view
    def get_global_stats(self) -> str:
        """
        Return contract-wide statistics.

        Returns:
            JSON string with total_translations, contract_version, paused.
        """
        return json.dumps({
            "total_translations": int(self.total_translations),
            "contract_version": self.contract_version,
            "paused": self.paused,
        })

    @gl.public.view
    def get_supported_languages(self) -> str:
        """
        Return all supported BCP-47 language codes.

        Returns:
            JSON array of language code strings.
        """
        return json.dumps(list(SUPPORTED_LANGUAGES.keys()))

    @gl.public.view
    def get_supported_domains(self) -> str:
        """
        Return all supported translation domain names.

        Returns:
            JSON array of domain name strings.
        """
        return json.dumps(SUPPORTED_DOMAINS)

    @gl.public.view
    def get_contract_info(self) -> str:
        """
        Return contract metadata.

        Returns:
            JSON string with version, owner address, and paused state.
        """
        return json.dumps({
            "version": self.contract_version,
            "owner": self.owner_address,
            "paused": self.paused,
        })

    @gl.public.view
    def get_glossary_term(
        self, domain: str, target_language: str, source_term: str
    ) -> str:
        """
        Look up a domain glossary entry.

        Args:
            domain:          Translation domain.
            target_language: Target language code.
            source_term:     Source-language term to look up.

        Returns:
            The preferred target-language term, or empty string if not found.
        """
        key = f"{domain}:{target_language}:{source_term.lower().strip()}"
        try:
            return self.glossary[key]
        except Exception:
            return ""

    @gl.public.view
    def get_rating(self, translation_id: str) -> str:
        """
        Retrieve a user rating for a translation.

        Returns:
            JSON string with rating data, or empty string if not rated.
        """
        try:
            return self.ratings[translation_id]
        except Exception:
            return ""

    # =========================================================================
    # PRIVATE helpers
    # =========================================================================

    def _store_result(
        self,
        translation_id: str,
        source_language: str,
        target_language: str,
        domain: str,
        final_translation: str,
        requestor_address: str,
        tone: str,
    ) -> None:
        """Persist a completed translation result and update counters."""
        result_blob: dict = {
            "translation_id": translation_id,
            "source_language": source_language,
            "target_language": target_language,
            "domain": domain,
            "final_translation": final_translation,
            "confidence_score": 85.0,
            "status": "COMPLETED",
            "requestor": requestor_address,
        }
        if tone:
            result_blob["tone"] = tone

        self.translations[translation_id] = json.dumps(result_blob)

        self.total_translations = u256(int(self.total_translations) + 1)

        if requestor_address:
            current = u256(0)
            try:
                current = self.user_translation_counts[requestor_address]
            except Exception:
                pass
            self.user_translation_counts[requestor_address] = u256(int(current) + 1)
