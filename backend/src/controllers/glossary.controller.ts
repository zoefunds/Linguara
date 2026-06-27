import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

export async function listTerms(req: AuthRequest, res: Response) {
  try {
    const terms = await prisma.glossaryTerm.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, terms);
  } catch {
    return sendError(res, 'Failed to fetch glossary', 500);
  }
}

export async function createTerm(req: AuthRequest, res: Response) {
  const { sourceTerm, targetTerm, sourceLang, targetLang, domain, notes } = req.body;
  if (!sourceTerm?.trim() || !targetTerm?.trim() || !targetLang) {
    return sendError(res, 'sourceTerm, targetTerm, and targetLang are required', 400);
  }
  try {
    const term = await prisma.glossaryTerm.create({
      data: {
        userId: req.user!.userId,
        sourceTerm: sourceTerm.trim(),
        targetTerm: targetTerm.trim(),
        sourceLang: sourceLang || 'en',
        targetLang,
        domain: domain || 'general',
        notes: notes?.trim() || null,
      },
    });
    return sendSuccess(res, term, 201);
  } catch {
    return sendError(res, 'Failed to create term', 500);
  }
}

export async function deleteTerm(req: AuthRequest, res: Response) {
  try {
    const term = await prisma.glossaryTerm.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!term) return sendError(res, 'Term not found', 404);
    await prisma.glossaryTerm.delete({ where: { id: req.params.id } });
    return sendSuccess(res, { deleted: true });
  } catch {
    return sendError(res, 'Failed to delete term', 500);
  }
}
