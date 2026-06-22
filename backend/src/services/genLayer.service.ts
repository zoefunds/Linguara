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

/**
 * Submit a translation write transaction using the user's wallet private key.
 */
export async function sendTranslationTx(
  userPrivateKey: string,
  translationId: string,
  sourceText: string,
  sourceLanguage: string,
  targetLanguage: string,
  domain: string,
  senderAddress: string
): Promise<string> {
  if (!CONTRACT) throw new Error('GENLAYER_CONTRACT_ADDRESS not configured');

  const client = await getGLClient(userPrivateKey);

  // Contract signature: translate_text(translation_id, source_text, source_language, target_language, domain, requestor_address)
  const txHash = await client.writeContract({
    address: CONTRACT,
    functionName: 'translate_text',
    args: [translationId, sourceText, sourceLanguage || 'auto', targetLanguage, domain || 'general', senderAddress],
    value: 0n,
  });

  logger.info('GenLayer writeContract submitted', { txHash });
  return txHash;
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
 * Wait until the transaction reaches ACCEPTED state using genlayer-js built-in polling.
 */
export async function pollUntilFinalized(txHash: string): Promise<TranslationConsensusResult> {
  const client = await getReadOnlyClient();

  try {
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      status: 'ACCEPTED',
      interval: 4000,
      retries: 90,
    });

    logger.info('GenLayer tx accepted', { txHash, receipt: JSON.stringify(receipt).slice(0, 200) });
    return parseResult(txHash, receipt);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('GenLayer waitForTransactionReceipt failed', { txHash, err: msg });
    throw e;
  }
}

function parseResult(txHash: string, receipt: any): TranslationConsensusResult {
  const consensusData = receipt?.consensus_data || receipt?.consensusData || {};

  // Extract translation from leader_receipt eq_outputs
  let finalTranslation = '';
  const leaderReceipts = consensusData.leader_receipt || [];
  if (leaderReceipts.length > 0) {
    const eqOutputs = leaderReceipts[0]?.eq_outputs || {};
    // eq_outputs["0"] is the first translation candidate
    const firstOutput = eqOutputs['0'] || eqOutputs[0];
    if (firstOutput?.payload?.readable) {
      finalTranslation = stripQuotes(firstOutput.payload.readable);
    }

    // Try to extract quality scores from eq_outputs (the scoring step)
    for (const key of Object.keys(eqOutputs)) {
      const payload = eqOutputs[key]?.payload?.readable;
      if (payload && payload.includes('semantic_score')) {
        try {
          const scores = JSON.parse(stripQuotes(payload));
          if (scores.semantic_score) {
            return buildResult(txHash, finalTranslation, scores, consensusData);
          }
        } catch {}
      }
    }
  }

  // Fallback: derive scores from votes
  const votes = consensusData.votes || {};
  const voteValues = Object.values(votes) as string[];
  const agreeCount = voteValues.filter(v => v === 'agree').length;
  const total = voteValues.length || 1;
  const confidenceScore = Math.min(100, (agreeCount / total) * 100) || 80;

  const validators = consensusData.validators || [];
  const agents = validators
    .filter((v: any) => v.vote === 'agree')
    .map((v: any, i: number) => ({
      agentId: i + 1,
      translation: finalTranslation,
      confidence: confidenceScore,
      semantic: confidenceScore * 0.96,
      tone: confidenceScore * 0.91,
      cultural: confidenceScore * 0.88,
      isConsensus: true,
    }));

  return {
    finalTranslation,
    confidenceScore,
    semanticScore: confidenceScore * 0.96,
    toneScore: confidenceScore * 0.91,
    culturalScore: confidenceScore * 0.88,
    txHash,
    agents: agents.length > 0 ? agents : [{
      agentId: 1,
      translation: finalTranslation,
      confidence: confidenceScore,
      semantic: confidenceScore * 0.96,
      tone: confidenceScore * 0.91,
      cultural: confidenceScore * 0.88,
      isConsensus: true,
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
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Number(v) || 0));
}
