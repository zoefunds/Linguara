import { config } from '../config/env';
import { logger } from '../config/logger';

export interface TranslationConsensusResult {
  finalTranslation: string;
  confidenceScore: number;
  semanticScore: number;
  toneScore: number;
  culturalScore: number;
  txHash: string;
  agents: Array<{
    agentId: number;
    translation: string;
    confidence: number;
    semantic: number;
    tone: number;
    cultural: number;
    isConsensus: boolean;
  }>;
}

// Dynamic ESM import that survives CJS compilation
const dynamicImport = new Function('specifier', 'return import(specifier)') as (s: string) => Promise<any>;

let _studionet: any = null;

async function loadStudionet() {
  if (!_studionet) {
    const chains = await dynamicImport('genlayer-js/chains');
    _studionet = chains.studionet;
  }
  return _studionet;
}

async function getGLClient(privateKey: string) {
  const chain = await loadStudionet();
  const gl = await dynamicImport('genlayer-js');
  const account = gl.createAccount(privateKey as `0x${string}`);
  return gl.createClient({ chain, account });
}

async function getReadOnlyClient() {
  const chain = await loadStudionet();
  const gl = await dynamicImport('genlayer-js');
  return gl.createClient({ chain });
}

const CONTRACT = config.genLayer.contractAddress as `0x${string}`;

const CHUNK_SIZE = 2500;   // chars per chunk sent to the contract
const MAX_CHUNK_CHARS = 14000; // hard contract limit is 15k, stay under it

/**
 * Split text into chunks at paragraph boundaries, each ≤ CHUNK_SIZE chars.
 * Returns [text] unchanged when text fits in one chunk.
 */
function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];

  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length > CHUNK_SIZE && current) {
      chunks.push(current.trim());
      current = para;
    } else if (para.length > MAX_CHUNK_CHARS) {
      // Paragraph itself is too long — split by sentence
      if (current) { chunks.push(current.trim()); current = ''; }
      const sentences = para.split(/(?<=[.!?])\s+/);
      let buf = '';
      for (const s of sentences) {
        const c = buf ? `${buf} ${s}` : s;
        if (c.length > CHUNK_SIZE && buf) {
          chunks.push(buf.trim());
          buf = s;
        } else {
          buf = c;
        }
      }
      if (buf) current = buf;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.filter(c => c.length > 0);
}

/**
 * Submit a translation write transaction using the user's wallet private key.
 * For texts > CHUNK_SIZE chars, sends multiple parallel transactions and returns
 * a synthetic "multi-chunk" pseudo-hash that the caller reassembles.
 */
export async function sendTranslationTx(
  userPrivateKey: string,
  translationId: string,
  sourceText: string,
  sourceLanguage: string,
  targetLanguage: string,
  domain: string,
  senderAddress: string,
  glossaryTerms: { sourceTerm: string; targetTerm: string }[] = []
): Promise<string> {
  if (!CONTRACT) throw new Error('GENLAYER_CONTRACT_ADDRESS not configured');

  // Serialise glossary as a JSON string so the contract can parse it
  const glossaryJson = glossaryTerms.length
    ? JSON.stringify(glossaryTerms.map(t => ({ src: t.sourceTerm, tgt: t.targetTerm })))
    : '[]';

  const chunks = splitIntoChunks(sourceText);

  if (chunks.length === 1) {
    const client = await getGLClient(userPrivateKey);
    const txHash = await client.writeContract({
      address: CONTRACT,
      functionName: 'translate_text',
      args: [translationId, sourceText, sourceLanguage || 'auto', targetLanguage, domain || 'general', senderAddress, glossaryJson],
      value: 0n,
    });
    logger.info('GenLayer tx submitted (single chunk)', { txHash, translationId, glossaryTerms: glossaryTerms.length });
    return txHash;
  }

  // Multi-chunk path
  logger.info('Long text detected, splitting into chunks', {
    translationId,
    totalChars: sourceText.length,
    chunkCount: chunks.length,
  });

  const client = await getGLClient(userPrivateKey);
  const chunkHashes = await Promise.all(
    chunks.map(async (chunk, i) => {
      const chunkId = `${translationId}__chunk_${i}`;
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'translate_text',
        args: [chunkId, chunk, sourceLanguage || 'auto', targetLanguage, domain || 'general', senderAddress, glossaryJson],
        value: 0n,
      });
      logger.info('GenLayer chunk submitted', { txHash, chunkId, index: i });
      return txHash;
    })
  );

  return JSON.stringify({ multi: true, hashes: chunkHashes, count: chunks.length });
}

/**
 * Read contract state (view function) without requiring a wallet.
 */
export async function readContract(functionName: string, args: unknown[] = []) {
  const client = await getReadOnlyClient();
  return client.readContract({
    address: CONTRACT,
    functionName,
    args,
  });
}

/**
 * Get transaction status from GenLayer.
 */
export async function getTransactionStatus(txHash: string) {
  const client = await getReadOnlyClient();

  try {
    const receipt = await client.getTransaction({ hash: txHash as `0x${string}` });
    return receipt;
  } catch (e) {
    logger.warn('getTransactionStatus failed', { txHash, err: String(e) });
    return null;
  }
}

/**
 * Wait until the transaction(s) reach ACCEPTED state.
 * Handles both single-tx and multi-chunk (JSON sentinel from sendTranslationTx).
 */
export async function pollUntilFinalized(txHashOrMeta: string): Promise<TranslationConsensusResult> {
  // Multi-chunk path
  if (txHashOrMeta.startsWith('{')) {
    let meta: { multi: boolean; hashes: string[]; count: number };
    try {
      meta = JSON.parse(txHashOrMeta);
    } catch {
      throw new Error('Invalid multi-chunk metadata');
    }

    if (meta.multi && Array.isArray(meta.hashes)) {
      logger.info('Polling multi-chunk translations', { count: meta.hashes.length });

      const client = await getReadOnlyClient();
      const receipts = await Promise.all(
        meta.hashes.map(hash =>
          client.waitForTransactionReceipt({
            hash: hash as `0x${string}`,
            status: 'ACCEPTED',
            interval: 6000,
            retries: 300,
          })
        )
      );

      // Extract translation from each chunk receipt and concatenate in order
      const chunkTranslations = receipts.map((r, i) => {
        const parsed = parseResult(meta.hashes[i], r);
        return parsed.finalTranslation;
      });

      const finalTranslation = chunkTranslations.join('\n\n');
      const firstResult = parseResult(meta.hashes[0], receipts[0]);

      logger.info('Multi-chunk translations assembled', {
        chunks: chunkTranslations.length,
        totalChars: finalTranslation.length,
      });

      return {
        ...firstResult,
        finalTranslation,
        txHash: meta.hashes[0], // use first hash as canonical reference
      };
    }
  }

  // Single-tx path (unchanged)
  const client = await getReadOnlyClient();
  try {
    const receipt = await client.waitForTransactionReceipt({
      hash: txHashOrMeta as `0x${string}`,
      status: 'ACCEPTED',
      interval: 6000,
      retries: 300,
    });
    logger.info('GenLayer tx accepted', { txHash: txHashOrMeta, receipt: JSON.stringify(receipt).slice(0, 200) });
    return parseResult(txHashOrMeta, receipt);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('GenLayer waitForTransactionReceipt failed', { txHash: txHashOrMeta, err: msg });
    throw e;
  }
}

// Decode literal \uXXXX escape sequences the LLM may output as plain text
function unescapeUnicode(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Parse the JSON blob returned by do_translate() in v3.4.0.
// IMPORTANT: never pass this through stripQuotes() first — it unescapes \" inside
// scores_raw, corrupting the JSON and making JSON.parse throw.
function extractFromContractJSON(raw: string): { translation: string; scores: any } | null {
  // Strategy 1: raw is directly a JSON string starting with {
  // e.g. `{"translation": "«...", "scores_raw": "{\"semantic\": ...}"}`
  const trimmed = raw.trim();
  const jsonStr = trimmed.startsWith('"') ? (() => { try { return JSON.parse(trimmed); } catch { return null; } })() : trimmed;
  if (!jsonStr || typeof jsonStr !== 'string') {
    // Strategy 2: raw IS the object already (genlayer-js auto-parses sometimes)
    if (typeof raw === 'object' && raw !== null && (raw as any).translation) {
      const r = raw as any;
      let scores: any = null;
      try { scores = JSON.parse(r.scores_raw); } catch {}
      return { translation: String(r.translation).trim(), scores };
    }
    return null;
  }

  try {
    const obj = JSON.parse(jsonStr);
    if (!obj?.translation) return null;
    let scores: any = null;
    if (obj.scores_raw) {
      try { scores = JSON.parse(obj.scores_raw); } catch {
        const m = String(obj.scores_raw).match(/\{[\s\S]*\}/);
        if (m) { try { scores = JSON.parse(m[0]); } catch {} }
      }
    }
    return { translation: unescapeUnicode(String(obj.translation).trim()), scores };
  } catch {
    return null;
  }
}

function parseResult(txHash: string, receipt: any): TranslationConsensusResult {
  const consensusData = receipt?.consensus_data || receipt?.consensusData || {};

  let finalTranslation = '';
  let parsedScores: any = null;

  const leaderReceipts = consensusData.leader_receipt || [];
  if (leaderReceipts.length > 0) {
    const eqOutputs = leaderReceipts[0]?.eq_outputs || {};
    const firstOutput = eqOutputs['0'] || eqOutputs[0];
    const raw = firstOutput?.payload?.readable;
    if (raw != null) {
      const extracted = extractFromContractJSON(typeof raw === 'string' ? raw : JSON.stringify(raw));
      if (extracted) {
        finalTranslation = extracted.translation;
        parsedScores = extracted.scores;
      } else {
        // v3.3.0 plain string output
        finalTranslation = stripQuotes(String(raw));
      }
    }
  }

  // If we got real scores from the contract, use them
  if (parsedScores && (parsedScores.semantic || parsedScores.tone || parsedScores.fluency)) {
    const semantic  = clamp(parsedScores.semantic  || parsedScores.semantic_score  || 80);
    const tone      = clamp(parsedScores.tone      || parsedScores.tone_score      || 80);
    const cultural  = clamp(parsedScores.cultural  || parsedScores.cultural_score  || 80);
    const fluency   = clamp(parsedScores.fluency   || parsedScores.fluency_score   || 80);
    const confidence = parseFloat(((semantic + tone + cultural + fluency) / 4).toFixed(1));

    const votes = consensusData.votes || {};
    const validators = Object.entries(votes).map(([, vote], i) => ({
      agentId: i + 1,
      translation: finalTranslation,
      confidence: vote === 'agree' ? confidence : confidence * 0.6,
      semantic,
      tone,
      cultural,
      isConsensus: vote === 'agree',
    }));

    return {
      finalTranslation,
      confidenceScore: confidence,
      semanticScore: semantic,
      toneScore: tone,
      culturalScore: cultural,
      txHash,
      agents: validators.length > 0 ? validators : [{
        agentId: 1, translation: finalTranslation, confidence, semantic, tone, cultural, isConsensus: true,
      }],
    };
  }

  // Fallback: derive scores from vote consensus ratio
  const votes = consensusData.votes || {};
  const voteValues = Object.values(votes) as string[];
  const agreeCount = voteValues.filter(v => v === 'agree').length;
  const total = voteValues.length || 1;
  const confidenceScore = Math.min(100, Math.round((agreeCount / total) * 100)) || 80;

  const agents = voteValues.map((vote, i) => ({
    agentId: i + 1,
    translation: finalTranslation,
    confidence: vote === 'agree' ? confidenceScore : confidenceScore * 0.6,
    semantic: confidenceScore * 0.96,
    tone: confidenceScore * 0.91,
    cultural: confidenceScore * 0.88,
    isConsensus: vote === 'agree',
  }));

  return {
    finalTranslation,
    confidenceScore,
    semanticScore: confidenceScore * 0.96,
    toneScore: confidenceScore * 0.91,
    culturalScore: confidenceScore * 0.88,
    txHash,
    agents: agents.length > 0 ? agents : [{
      agentId: 1, translation: finalTranslation, confidence: confidenceScore,
      semantic: confidenceScore * 0.96, tone: confidenceScore * 0.91,
      cultural: confidenceScore * 0.88, isConsensus: true,
    }],
  };
}

function buildResult(
  txHash: string,
  finalTranslation: string,
  scores: any,
  consensusData: any
): TranslationConsensusResult {
  const semantic = clamp(scores.semantic_score || 0);
  const tone = clamp(scores.tone_score || 0);
  const cultural = clamp(scores.cultural_score || 0);
  const fluency = clamp(scores.fluency_score || 0);
  const domain = clamp(scores.domain_accuracy || 0);
  const confidenceScore = (semantic + tone + cultural + fluency + domain) / 5;

  const votes = consensusData.votes || {};
  const validators = Object.entries(votes).map(([addr, vote], i) => ({
    agentId: i + 1,
    translation: finalTranslation,
    confidence: vote === 'agree' ? confidenceScore : confidenceScore * 0.6,
    semantic,
    tone,
    cultural,
    isConsensus: vote === 'agree',
  }));

  return {
    finalTranslation,
    confidenceScore,
    semanticScore: semantic,
    toneScore: tone,
    culturalScore: cultural,
    txHash,
    agents: validators,
  };
}

function stripQuotes(s: string): string {
  const trimmed = s.trim();
  let result = trimmed;
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    result = trimmed.slice(1, -1);
  }
  // Unescape JSON-encoded escape sequences that GenLayer stores in payload.readable
  return result
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"');
}

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Number(v) || 0));
}
