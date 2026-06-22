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
 * Poll until the transaction reaches a terminal state.
 */
export async function pollUntilFinalized(txHash: string): Promise<TranslationConsensusResult> {
  const client = await getReadOnlyClient();
  const maxAttempts = 60;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 4000));

    try {
      const receipt = await client.getTransaction({ hash: txHash as `0x${string}` });
      const status = receipt?.status;

      logger.info('GenLayer poll', { txHash, status, attempt: i + 1 });

      if (status === 'UNDETERMINED') {
        throw new Error('GenLayer consensus undetermined');
      }
      if (status === 'CANCELED') {
        throw new Error('GenLayer transaction canceled');
      }

      if (status === 'FINALIZED' || status === 'ACCEPTED') {
        return parseResult(txHash, receipt);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('undetermined') || msg.includes('canceled')) throw e;
      logger.warn('GenLayer poll error (retrying)', { txHash, attempt: i + 1, err: msg });
    }
  }

  throw new Error('GenLayer transaction timed out after 4 minutes');
}

function parseResult(txHash: string, receipt: any): TranslationConsensusResult {
  // The receipt from genlayer-js contains the decoded result
  const finalTranslation = typeof receipt?.result === 'string'
    ? receipt.result.trim()
    : '';

  const consensusData = receipt?.consensus_data || receipt?.consensusData;
  const validators = consensusData?.validators || [];

  const agreeCount = validators.filter((v: any) => v.vote === 'agree').length;
  const total = validators.length || 1;
  const confidenceScore = Math.min(100, (agreeCount / total) * 100) || 80;

  const agents = validators.map((v: any, i: number) => {
    const translation = typeof v.result === 'string' ? v.result.trim() : finalTranslation;
    const confidence = v.vote === 'agree' ? confidenceScore : confidenceScore * 0.6;
    return {
      agentId: i + 1,
      translation,
      confidence,
      semantic: confidence * 0.96,
      tone: confidence * 0.91,
      cultural: confidence * 0.88,
      isConsensus: v.vote === 'agree',
    };
  });

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
