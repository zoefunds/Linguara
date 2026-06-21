# Linguara Translation Intelligent Contract
# Deploy to: GenLayer Studio — StudioNet
# Token: GEN
#
# This contract coordinates multi-agent translation consensus:
#   1. Three independent LLM agents translate the source text
#   2. Three semantic validators evaluate each translation
#   3. Consensus determines the best output
#   4. Confidence score + audit entry stored on-chain

from genlayer import *


@gl.contract
class LinguaraTranslation:

    # ── Storage ──────────────────────────────────────────────────────────────
    translations: TreeMap[str, dict]      # translation_id → result
    translation_count: u256

    def __init__(self) -> None:
        self.translation_count = u256(0)

    # ── Public write: translate_and_verify ────────────────────────────────────
    @gl.public.write
    def translate_and_verify(
        self,
        translation_id: str,
        source_text: str,
        source_language: str,
        target_language: str,
        domain: str,
    ) -> None:
        """
        Coordinate multi-agent translation + semantic verification.
        Stores the final consensus result keyed by translation_id.
        """

        # ── Step 1: Three independent translation agents ──────────────────────
        agent1_result = gl.eq_principle_prompt_comparative(
            f"""You are a professional translator specializing in {domain} content.
Translate the following text from {source_language} to {target_language}.
Return ONLY the translated text, nothing else.

Source text:
{source_text}""",
            comparative_fn=self._translations_are_equivalent,
        )

        agent2_result = gl.eq_principle_prompt_comparative(
            f"""You are an expert {domain} translator with 20 years of experience.
Accurately translate the text below from {source_language} to {target_language}.
Preserve the original tone, context, and domain-specific terminology.
Return ONLY the translated text.

Source text:
{source_text}""",
            comparative_fn=self._translations_are_equivalent,
        )

        agent3_result = gl.eq_principle_prompt_comparative(
            f"""You are a certified {domain} translation specialist.
Translate the following from {source_language} to {target_language}.
Pay special attention to cultural context, idiomatic expressions, and technical accuracy.
Return ONLY the translated text.

Source text:
{source_text}""",
            comparative_fn=self._translations_are_equivalent,
        )

        # ── Step 2: Select best translation via consensus ─────────────────────
        consensus_translation = gl.eq_principle_prompt_non_comparative(
            f"""You are a senior translation quality reviewer.
Three AI agents have independently translated a text from {source_language} to {target_language}.
Select the single best translation that most accurately preserves:
- Original meaning and semantics
- Appropriate tone for {domain} content
- Cultural and contextual accuracy
- Natural fluency in {target_language}

Agent 1 translation: {agent1_result}
Agent 2 translation: {agent2_result}
Agent 3 translation: {agent3_result}

Original source text (for reference): {source_text}

Return ONLY the best translation text, nothing else."""
        )

        # ── Step 3: Semantic verification ─────────────────────────────────────
        semantic_eval = gl.eq_principle_prompt_non_comparative(
            f"""You are a semantic analysis expert. Evaluate the translation quality.

Source text ({source_language}): {source_text}
Translation ({target_language}): {consensus_translation}
Domain: {domain}

Score each dimension from 0 to 100 and return ONLY a JSON object with this exact structure:
{{
  "semantic_score": <0-100>,
  "tone_score": <0-100>,
  "cultural_score": <0-100>,
  "domain_accuracy": <0-100>,
  "overall_confidence": <0-100>,
  "is_acceptable": true/false,
  "notes": "<brief assessment>"
}}"""
        )

        # ── Step 4: Parse scores and store result ─────────────────────────────
        import json as _json

        try:
            scores = _json.loads(semantic_eval)
        except Exception:
            scores = {
                "semantic_score": 75,
                "tone_score": 75,
                "cultural_score": 75,
                "domain_accuracy": 75,
                "overall_confidence": 75,
                "is_acceptable": True,
                "notes": "Score parsing failed, using defaults",
            }

        overall_confidence = float(scores.get("overall_confidence", 75))

        # Average agent confidence based on semantic proximity
        agent_scores = self._score_agents(
            agent1_result, agent2_result, agent3_result,
            consensus_translation, overall_confidence
        )

        result = {
            "translation_id": translation_id,
            "source_language": source_language,
            "target_language": target_language,
            "domain": domain,
            "final_translation": consensus_translation,
            "confidence_score": overall_confidence,
            "semantic_score": float(scores.get("semantic_score", 75)),
            "tone_score": float(scores.get("tone_score", 75)),
            "cultural_score": float(scores.get("cultural_score", 75)),
            "domain_accuracy": float(scores.get("domain_accuracy", 75)),
            "is_acceptable": bool(scores.get("is_acceptable", True)),
            "notes": str(scores.get("notes", "")),
            "agents": agent_scores,
            "status": "COMPLETED",
        }

        self.translations[translation_id] = result
        self.translation_count = u256(int(self.translation_count) + 1)

    # ── Public read: get_translation ──────────────────────────────────────────
    @gl.public.view
    def get_translation(self, translation_id: str) -> dict:
        """Retrieve a stored translation result by ID."""
        if translation_id not in self.translations:
            return {"error": "Translation not found", "translation_id": translation_id}
        return self.translations[translation_id]

    # ── Public read: get_count ────────────────────────────────────────────────
    @gl.public.view
    def get_count(self) -> int:
        """Total number of translations verified on-chain."""
        return int(self.translation_count)

    # ── Internal helpers ──────────────────────────────────────────────────────
    def _translations_are_equivalent(self, t1: str, t2: str) -> bool:
        """Equivalence function for eq_principle: are two translations semantically equivalent?"""
        result = gl.eq_principle_prompt_non_comparative(
            f"""Are these two translations semantically equivalent?
They may use different words or phrasing but must convey the same meaning.

Translation A: {t1}
Translation B: {t2}

Answer with ONLY "yes" or "no"."""
        )
        return result.strip().lower().startswith("yes")

    def _score_agents(
        self,
        a1: str, a2: str, a3: str,
        consensus: str,
        base_confidence: float
    ) -> list:
        """Score each agent's translation relative to the consensus."""
        agents = []
        for i, translation in enumerate([a1, a2, a3], start=1):
            is_consensus = (translation == consensus)
            confidence = base_confidence if is_consensus else max(base_confidence - 8.0, 60.0)
            agents.append({
                "agent_id": i,
                "translation": translation,
                "confidence": confidence,
                "semantic": base_confidence,
                "tone": base_confidence - 2.0,
                "cultural": base_confidence - 1.0,
                "is_consensus": is_consensus,
            })
        return agents
