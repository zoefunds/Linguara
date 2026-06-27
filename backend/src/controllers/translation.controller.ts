import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { sendTranslationTx, pollUntilFinalized } from '../services/genLayer.service';
import { sendTranslationCompleteEmail } from '../services/email.service';
import { decryptPrivateKey } from '../utils/wallet';
import { logger } from '../config/logger';

// If the contract returned raw JSON {"translation":"...","scores_raw":"..."}, extract just the text.
// Uses regex extraction so malformed scores_raw JSON can't break the parse.
function cleanTranslation(raw: string | null): string | null {
  if (!raw) return raw;
  const trimmed = raw.trim();

  if (trimmed.startsWith('{')) {
    // First try full JSON.parse (handles properly formed output)
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.translation && typeof parsed.translation === 'string') {
        return unescapeUnicode(parsed.translation.trim());
      }
    } catch {}

    // Fallback: regex-extract the value of "translation" key from the JSON string.
    // This handles cases where scores_raw contains malformed nested JSON that breaks full parse.
    const match = trimmed.match(/"translation"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (match) {
      // match[1] is the raw JSON string value — JSON.parse a synthetic wrapper to decode escapes
      try {
        const decoded = JSON.parse(`"${match[1]}"`);
        return unescapeUnicode(decoded.trim());
      } catch {
        return unescapeUnicode(match[1].trim());
      }
    }
  }

  return unescapeUnicode(raw);
}

// Decode literal \uXXXX sequences that the LLM may have output as plain text
function unescapeUnicode(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export async function createTranslation(req: AuthRequest, res: Response) {
  const { sourceText, targetLanguage, sourceLanguage, domain, documentType } = req.body;

  if (!sourceText?.trim()) return sendError(res, 'sourceText is required', 400);
  if (!targetLanguage) return sendError(res, 'targetLanguage is required', 400);

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wallet) {
      return sendError(res, 'No wallet found for user. Please re-register.', 400);
    }

    let userPrivateKey: string;
    try {
      userPrivateKey = decryptPrivateKey(
        wallet.encryptedPrivateKey,
        wallet.iv,
        wallet.authTag,
        req.user!.userId
      );
    } catch (err) {
      logger.error('Failed to decrypt user wallet', { userId: req.user!.userId });
      return sendError(res, 'Wallet decryption failed', 500);
    }

    const senderAddress = wallet.address;

    const translation = await prisma.translation.create({
      data: {
        userId: req.user!.userId,
        sourceText,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
        documentType: documentType || 'TEXT',
        domain: domain || 'general',
        status: 'PENDING',
      },
    });

    // Respond immediately — never block on GenLayer
    res.status(202).json({
      success: true,
      data: {
        translationId: translation.id,
        txHash: null,
        status: 'PENDING',
        senderAddress,
      },
    });

    // Fetch glossary terms for this language pair to pass to the contract
    const glossaryTerms = await prisma.glossaryTerm.findMany({
      where: { userId: req.user!.userId, targetLang: targetLanguage },
      select: { sourceTerm: true, targetTerm: true },
    });

    // Fire GenLayer call fully async after response is sent
    submitToGenLayer(translation.id, req.user!.userId, userPrivateKey, senderAddress, {
      sourceText,
      targetLanguage,
      sourceLanguage: sourceLanguage || 'auto',
      domain: domain || 'general',
      glossaryTerms,
    });
  } catch (err) {
    logger.error('Create translation error', { err });
    if (!res.headersSent) return sendError(res, 'Failed to create translation', 500);
  }
}

async function submitToGenLayer(
  translationId: string,
  userId: string,
  userPrivateKey: string,
  senderAddress: string,
  params: { sourceText: string; targetLanguage: string; sourceLanguage: string; domain: string; glossaryTerms?: { sourceTerm: string; targetTerm: string }[] }
) {
  try {
    await prisma.translation.update({
      where: { id: translationId },
      data: { status: 'PROCESSING' },
    });

    const txHashOrMeta = await sendTranslationTx(
      userPrivateKey,
      translationId,
      params.sourceText,
      params.sourceLanguage,
      params.targetLanguage,
      params.domain,
      senderAddress,
      params.glossaryTerms || []
    );

    // For multi-chunk, store the first hash so the explorer link works
    const displayHash = txHashOrMeta.startsWith('{')
      ? JSON.parse(txHashOrMeta).hashes[0]
      : txHashOrMeta;

    logger.info('GenLayer tx submitted', { txHash: displayHash, translationId });

    await prisma.translation.update({
      where: { id: translationId },
      data: { contractTxHash: displayHash, status: 'PROCESSING' },
    });

    const txHash = txHashOrMeta;

    await prisma.auditLog.create({
      data: {
        translationId,
        userId,
        eventType: 'TRANSLATION_SUBMITTED_ONCHAIN',
        actor: userId,
        payload: { txHash: displayHash, senderAddress, ...params },
        onChainRef: displayHash,
      },
    });

    await pollAndSaveResult(translationId, userId, txHash, displayHash);
  } catch (err) {
    logger.error('submitToGenLayer failed', { err, translationId });
    await prisma.translation.update({
      where: { id: translationId },
      data: { status: 'FAILED' },
    }).catch(() => {});
    await prisma.auditLog.create({
      data: {
        translationId,
        userId,
        eventType: 'TRANSLATION_FAILED',
        actor: 'system',
        payload: { error: String(err) },
      },
    }).catch(() => {});
  }
}

async function pollAndSaveResult(translationId: string, userId: string, txHash: string, displayHash: string) {
  const result = await pollUntilFinalized(txHash);

  for (const agent of result.agents) {
    await prisma.translationResult.create({
      data: {
        translationId,
        agentId: agent.agentId,
        translatedText: agent.translation,
        confidenceScore: agent.confidence,
        semanticScore: agent.semantic,
        toneScore: agent.tone,
        culturalScore: agent.cultural,
        isConsensus: agent.isConsensus,
      },
    });
  }

  await prisma.translation.update({
    where: { id: translationId },
    data: {
      status: 'COMPLETED',
      finalTranslation: cleanTranslation(result.finalTranslation),
      confidenceScore: result.confidenceScore,
      contractTxHash: result.txHash,
      completedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      translationId,
      userId,
      eventType: 'TRANSLATION_COMPLETED',
      actor: 'system',
      payload: { confidenceScore: result.confidenceScore, txHash: result.txHash },
      onChainRef: result.txHash,
    },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await sendTranslationCompleteEmail(user.email, user.fullName, translationId, result.confidenceScore)
      .catch(() => {});
  }
}

export async function getTranslation(req: AuthRequest, res: Response) {
  try {
    const translation = await prisma.translation.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { results: true },
    });
    if (!translation) return sendError(res, 'Translation not found', 404);
    return sendSuccess(res, { ...translation, finalTranslation: cleanTranslation(translation.finalTranslation) });
  } catch {
    return sendError(res, 'Failed to fetch translation', 500);
  }
}

export async function listTranslations(req: AuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (page - 1) * limit;

  try {
    const [items, total] = await Promise.all([
      prisma.translation.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: { results: { where: { isConsensus: true } } },
      }),
      prisma.translation.count({ where: { userId: req.user!.userId } }),
    ]);
    const cleaned = items.map(t => ({ ...t, finalTranslation: cleanTranslation(t.finalTranslation) }));
    return sendPaginated(res, cleaned, total, page, limit);
  } catch {
    return sendError(res, 'Failed to list translations', 500);
  }
}

export async function getAuditLog(req: AuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = (page - 1) * limit;

  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.auditLog.count({ where: { userId: req.user!.userId } }),
    ]);
    return sendPaginated(res, logs, total, page, limit);
  } catch {
    return sendError(res, 'Failed to fetch audit logs', 500);
  }
}

export async function extractFile(req: AuthRequest, res: Response) {
  const { base64, filename, mimeType } = req.body;
  if (!base64 || !filename) return sendError(res, 'base64 and filename required', 400);

  try {
    const buffer = Buffer.from(base64, 'base64');

    if (mimeType === 'text/plain' || filename.endsWith('.txt')) {
      const text = buffer.toString('utf-8');
      return sendSuccess(res, { text, filename });
    }

    if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      const extracted = (result.text || '').trim();
      if (!extracted) return sendError(res, 'No text found in PDF. The file may be scanned or image-based.', 422);
      return sendSuccess(res, { text: extracted, filename });
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filename.endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default;
      const { value } = await mammoth.extractRawText({ buffer });
      const extracted = (value || '').trim();
      if (!extracted) return sendError(res, 'No text found in DOCX file.', 422);
      return sendSuccess(res, { text: extracted, filename });
    }

    return sendError(res, 'Unsupported file type. Please upload a TXT, PDF, or DOCX file.', 422);
  } catch (err: any) {
    logger.error('File extraction failed', { filename, error: err?.message });
    return sendError(res, 'File extraction failed. The file may be corrupted or password-protected.', 500);
  }
}

export async function getChainStatus(req: AuthRequest, res: Response) {
  try {
    const translation = await prisma.translation.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      select: { contractTxHash: true, status: true },
    });
    if (!translation) return sendError(res, 'Translation not found', 404);
    if (!translation.contractTxHash) {
      return sendSuccess(res, { dbStatus: translation.status, chainStatus: null });
    }

    const { getTransactionStatus } = await import('../services/genLayer.service');
    const receipt = await getTransactionStatus(translation.contractTxHash);
    return sendSuccess(res, {
      dbStatus: translation.status,
      txHash: translation.contractTxHash,
      chainStatus: receipt?.status ?? null,
      receipt: receipt ?? null,
    });
  } catch {
    return sendError(res, 'Failed to fetch chain status', 500);
  }
}

export async function rateTranslation(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) return sendError(res, 'Rating must be between 1 and 5', 400);
  try {
    const translation = await prisma.translation.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!translation) return sendError(res, 'Translation not found', 404);
    await prisma.translation.update({
      where: { id },
      data: { userRating: rating } as any,
    });
    return sendSuccess(res, { rating });
  } catch {
    return sendError(res, 'Failed to submit rating', 500);
  }
}
