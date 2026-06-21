import { config } from '../config/env';
import { logger } from '../config/logger';

interface TranslationConsensusResult {
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

export async function callGenLayerContract(
  sourceText: string,
  sourceLanguage: string,
  targetLanguage: string,
  domain: string
): Promise<TranslationConsensusResult> {
  if (!config.genLayer.contractAddress) {
    throw new Error('GenLayer contract address not configured');
  }

  try {
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [{
        to: config.genLayer.contractAddress,
        data: JSON.stringify({
          method: 'translate_and_verify',
          args: { sourceText, sourceLanguage, targetLanguage, domain },
        }),
      }],
      id: 1,
    };

    const response = await fetch(config.genLayer.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json() as { error?: { message: string }; result?: string };

    if (result.error) {
      throw new Error(result.error.message);
    }

    logger.info('GenLayer contract called', { txHash: result.result });

    return await pollForResult(result.result!);
  } catch (err) {
    logger.error('GenLayer call failed', { err });
    throw err;
  }
}

async function pollForResult(txHash: string): Promise<TranslationConsensusResult> {
  const maxAttempts = 30;
  const pollInterval = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, pollInterval));

    try {
      const response = await fetch(config.genLayer.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [txHash],
          id: 1,
        }),
      });

      const json = await response.json() as { result?: { status: string; logs: any[] } };
      const result = json.result;
      if (result?.status === '0x1' && result?.logs?.length > 0) {
        return parseContractResult(txHash, result.logs);
      }
    } catch (e) {
      logger.warn(`Poll attempt ${i + 1} failed`, { txHash });
    }
  }

  throw new Error('GenLayer transaction timed out');
}

function parseContractResult(txHash: string, logs: any[]): TranslationConsensusResult {
  // Parse the contract event logs into structured result
  // This will be updated once the contract is deployed and ABI is known
  const data = logs[0]?.data ? JSON.parse(
    Buffer.from(logs[0].data.slice(2), 'hex').toString('utf8')
  ) : {};

  return {
    finalTranslation: data.finalTranslation || '',
    confidenceScore: data.confidenceScore || 0,
    semanticScore: data.semanticScore || 0,
    toneScore: data.toneScore || 0,
    culturalScore: data.culturalScore || 0,
    txHash,
    agents: data.agents || [],
  };
}
