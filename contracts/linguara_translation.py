# Linguara Translation Intelligent Contract
# Platform: Linguara — Trustworthy Multilingual Translation Through Decentralized AI Consensus
# Deploy to: GenLayer Studio → StudioNet
# Version: 3.2.0
#
# API confirmed from GenLayer source (yeagerai/genvm):
#   - LLM call:  gl.nondet.exec_prompt(prompt)  — inside a run() fn
#   - Consensus: gl.eq_principle.prompt_comparative(run, principle)
#   - Class:     class X(gl.Contract)  — NOT @gl.contract (causes schema error)
#   - Imports:   from genlayer import *

# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


DOMAIN_INSTRUCTIONS = {
    "general":    "Translate naturally and fluently. Preserve the original tone and intent.",
    "legal":      "Legal document. Use precise legal terminology. Preserve all clause structures exactly. Do not paraphrase.",
    "medical":    "Medical content. Use correct clinical terminology. Preserve drug names, dosages, and procedures exactly.",
    "technical":  "Technical documentation. Preserve all technical terms, commands, and specifications exactly.",
    "financial":  "Financial content. Preserve all figures, percentages, instruments, and regulatory terminology exactly.",
    "government": "Government document. Use formal register. Preserve all reference numbers, titles, and institutional names.",
    "literary":   "Literary content. Preserve the author's voice, style, rhythm, and literary devices.",
    "scientific": "Scientific content. Preserve all technical terminology, units, chemical names, and citations exactly.",
    "news":       "Journalistic content. Maintain objective, clear, concise style. Preserve names, places, and dates exactly.",
    "marketing":  "Marketing content. Adapt culturally while preserving brand voice, tone, and persuasive intent.",
}

SUPPORTED_LANGUAGES = {
    "auto": "Auto-detect", "en": "English", "fr": "French", "es": "Spanish",
    "de": "German", "pt": "Portuguese", "it": "Italian", "nl": "Dutch",
    "ru": "Russian", "zh": "Chinese (Simplified)", "zh-tw": "Chinese (Traditional)",
    "ja": "Japanese", "ko": "Korean", "ar": "Arabic", "hi": "Hindi",
    "tr": "Turkish", "pl": "Polish", "sv": "Swedish", "no": "Norwegian",
    "da": "Danish", "fi": "Finnish", "cs": "Czech", "ro": "Romanian",
    "hu": "Hungarian", "uk": "Ukrainian", "el": "Greek", "he": "Hebrew",
    "id": "Indonesian", "ms": "Malay", "th": "Thai", "vi": "Vietnamese",
    "bn": "Bengali", "sw": "Swahili", "yo": "Yoruba", "ha": "Hausa",
    "af": "Afrikaans", "ca": "Catalan", "lt": "Lithuanian", "lv": "Latvian",
    "et": "Estonian", "sr": "Serbian", "bg": "Bulgarian", "hr": "Croatian",
    "fa": "Persian", "ur": "Urdu", "tl": "Filipino",
}


class LinguaraTranslation(gl.Contract):
    """
    Linguara decentralised translation contract v3.2.0.

    Each of GenLayer's 5 validators independently runs translate_text,
    making one LLM call via gl.nondet.exec_prompt. The eq_principle
    verifies validators agree on meaning — that IS the quality layer.

    Storage:
        translations            TreeMap[str, str]   translation_id → JSON
        user_translation_counts TreeMap[str, u256]  wallet → count
        total_translations      u256
        contract_version        str
        owner_address           str
        paused                  bool
    """

    translations: TreeMap[str, str]
    user_translation_counts: TreeMap[str, u256]
    total_translations: u256
    contract_version: str
    owner_address: str
    paused: bool

    def __init__(self, owner_address: str) -> None:
        self.total_translations = u256(0)
        self.contract_version = "3.2.0"
        self.owner_address = owner_address
        self.paused = False

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

        One LLM call per validator. GenLayer's 5 validators each run this
        independently and the prompt_comparative equivalence principle
        ensures they agree on meaning before accepting.

        For texts longer than 3,000 chars the backend splits into chunks
        and calls this once per chunk (parallel txs), then reassembles.

        Args:
            translation_id:    Unique UUID from backend (or uuid__chunk_N).
            source_text:       Text to translate. Max 15,000 chars per call.
            source_language:   BCP-47 code or "auto".
            target_language:   BCP-47 code.
            domain:            Translation domain.
            requestor_address: Caller wallet for attribution.
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

        src_label = SUPPORTED_LANGUAGES.get(
            source_language,
            source_language if source_language != "auto" else "the source language",
        )
        tgt_label = SUPPORTED_LANGUAGES.get(target_language, target_language)
        domain_instruction = DOMAIN_INSTRUCTIONS.get(domain, DOMAIN_INSTRUCTIONS["general"])

        prompt = (
            f"You are a professional translator. "
            f"Translate the following text from {src_label} to {tgt_label}.\n\n"
            f"Domain: {domain}\n"
            f"Instructions: {domain_instruction}\n\n"
            f"Rules:\n"
            f"- Output ONLY the translated text. No explanations, no notes, no preamble.\n"
            f"- Preserve all formatting, paragraph breaks, bullet points, and structure.\n"
            f"- Preserve proper nouns, brand names, and technical terms as appropriate.\n"
            f"- Do not add content that is not in the original.\n\n"
            f"Text to translate:\n{source_text}"
        )

        def do_translate():
            return gl.nondet.exec_prompt(prompt)

        final_translation = gl.eq_principle.prompt_comparative(
            do_translate,
            "The translations convey the same core meaning and information, "
            "even if they use different wording or phrasing.",
        )

        self.translations[translation_id] = json.dumps({
            "translation_id": translation_id,
            "source_language": source_language,
            "target_language": target_language,
            "domain": domain,
            "final_translation": str(final_translation).strip(),
            "confidence_score": 85.0,
            "status": "COMPLETED",
            "requestor": requestor_address,
        })

        self.total_translations = u256(int(self.total_translations) + 1)

        if requestor_address:
            current = u256(0)
            try:
                current = self.user_translation_counts[requestor_address]
            except Exception:
                pass
            self.user_translation_counts[requestor_address] = u256(int(current) + 1)

    @gl.public.write
    def rate_translation(
        self,
        translation_id: str,
        rating: int,
        feedback: str,
        rater_address: str,
    ) -> None:
        """Submit a 1–5 star rating for a completed translation."""
        if rating < 1 or rating > 5:
            raise Exception("Rating must be between 1 and 5")
        key = f"rating:{translation_id}"
        self.translations[key] = json.dumps({
            "translation_id": translation_id,
            "rating": rating,
            "feedback": feedback[:500] if feedback else "",
            "rater": rater_address,
        })

    @gl.public.view
    def get_translation(self, translation_id: str) -> str:
        """Retrieve a stored translation by ID. Returns JSON string or empty string."""
        try:
            return self.translations[translation_id]
        except Exception:
            return ""

    @gl.public.view
    def get_translation_status(self, translation_id: str) -> str:
        """Returns 'COMPLETED' or 'NOT_FOUND'."""
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
        """Returns per-wallet translation count as JSON."""
        try:
            count = int(self.user_translation_counts[wallet_address])
        except Exception:
            count = 0
        return json.dumps({"wallet": wallet_address, "translation_count": count})

    @gl.public.view
    def get_global_stats(self) -> str:
        """Returns contract-wide stats as JSON."""
        return json.dumps({
            "total_translations": int(self.total_translations),
            "contract_version": self.contract_version,
            "paused": self.paused,
        })

    @gl.public.view
    def get_contract_info(self) -> str:
        """Returns version and owner as JSON."""
        return json.dumps({
            "version": self.contract_version,
            "owner": self.owner_address,
            "paused": self.paused,
        })
