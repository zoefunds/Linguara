import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { sendTranslationTx, pollUntilFinalized } from '../services/genLayer.service';
import { sendTranslationCompleteEmail } from '../services/email.service';
import { logger } from '../config/logger';

export async function createTranslation(req: AuthRequest, res: Response) {
  const { sourceText, targetLanguage, sourceLanguage, domain, documentType } = req.body;

  if (!sourceText?.trim()) return sendError(res, 'sourceText is required', 400);
  if (!targetLanguage) return sendError(res, 'targetLanguage is required', 400);

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
      select: { address: true },
    });

    const senderAddress = wallet?.address || '0x0000000000000000000000000000000000000001';

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

    // Fire GenLayer call fully async after response is sent
    submitToGenLayer(translation.id, req.user!.userId, senderAddress, {
      sourceText,
      targetLanguage,
      sourceLanguage: sourceLanguage || 'auto',
      domain: domain || 'general',
    });
  } catch (err) {
    logger.error('Create translation error', { err });
    if (!res.headersSent) return sendError(res, 'Failed to create translation', 500);
  }
}

async function submitToGenLayer(
  translationId: string,
  userId: string,
  senderAddress: string,
  params: { sourceText: string; targetLanguage: string; sourceLanguage: string; domain: string }
) {
  try {
    await prisma.translation.update({
      where: { id: translationId },
      data: { status: 'PROCESSING' },
    });

    const txHash = await sendTranslationTx(
      senderAddress,
      params.sourceText,
      params.targetLanguage,
      params.sourceLanguage,
      params.domain
    );

    logger.info('GenLayer tx submitted', { txHash, translationId });

    await prisma.translation.update({
      where: { id: translationId },
      data: { contractTxHash: txHash, status: 'PROCESSING' },
    });

    await prisma.auditLog.create({
      data: {
        translationId,
        userId,
        eventType: 'TRANSLATION_SUBMITTED_ONCHAIN',
        actor: userId,
        payload: { txHash, senderAddress, ...params },
        onChainRef: txHash,
      },
    });

    await pollAndSaveResult(translationId, userId, txHash);
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

async function pollAndSaveResult(translationId: string, userId: string, txHash: string) {
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
      finalTranslation: result.finalTranslation,
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
    return sendSuccess(res, translation);
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
    return sendPaginated(res, items, total, page, limit);
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
