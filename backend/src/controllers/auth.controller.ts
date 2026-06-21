import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { redis, CACHE_TTL } from '../config/redis';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateWallet, decryptPrivateKey } from '../utils/wallet';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';

export async function register(req: Request, res: Response) {
  const { email, password, fullName } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return sendError(res, 'Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, emailVerifyToken },
    });

    const walletData = generateWallet(user.id);
    await prisma.wallet.create({
      data: {
        userId: user.id,
        address: walletData.address,
        encryptedPrivateKey: walletData.encryptedPrivateKey,
        iv: walletData.iv,
        authTag: walletData.authTag,
      },
    });

    await sendVerificationEmail(email, fullName, emailVerifyToken);

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info('User registered', { userId: user.id });

    return sendSuccess(res, {
      user: { id: user.id, email: user.email, fullName: user.fullName, plan: user.plan },
      wallet: { address: walletData.address },
      accessToken,
      refreshToken,
    }, 201);
  } catch (err) {
    logger.error('Register error', { err });
    return sendError(res, 'Registration failed', 500);
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        plan: user.plan,
        emailVerified: user.emailVerified,
        preferredLanguage: user.preferredLanguage,
      },
      wallet: { address: user.wallet?.address },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    logger.error('Login error', { err });
    return sendError(res, 'Login failed', 500);
  }
}

export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, 'Refresh token required', 400);

  try {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return sendError(res, 'Invalid refresh token', 401);
    }

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const accessToken = signAccessToken({ userId: payload.userId, email: payload.email });
    const newRefreshToken = signRefreshToken({ userId: payload.userId, email: payload.email });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return sendSuccess(res, { accessToken, refreshToken: newRefreshToken });
  } catch {
    return sendError(res, 'Invalid refresh token', 401);
  }
}

export async function logout(req: AuthRequest, res: Response) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  return sendSuccess(res, { message: 'Logged out successfully' });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.query as { token: string };
  try {
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) return sendError(res, 'Invalid or expired verification link', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });

    return sendSuccess(res, { message: 'Email verified successfully' });
  } catch (err) {
    return sendError(res, 'Verification failed', 500);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return sendSuccess(res, { message: 'If that email exists, a reset link was sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: token, resetPasswordExpiry: expiry },
    });

    await sendPasswordResetEmail(email, user.fullName, token);
    return sendSuccess(res, { message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    return sendError(res, 'Request failed', 500);
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) return sendError(res, 'Invalid or expired reset link', 400);

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetPasswordToken: null, resetPasswordExpiry: null },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    return sendSuccess(res, { message: 'Password reset successfully' });
  } catch {
    return sendError(res, 'Reset failed', 500);
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { wallet: { select: { address: true } } },
    });

    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      plan: user.plan,
      emailVerified: user.emailVerified,
      preferredLanguage: user.preferredLanguage,
      wallet: { address: user.wallet?.address },
      createdAt: user.createdAt,
    });
  } catch {
    return sendError(res, 'Failed to fetch profile', 500);
  }
}

export async function exportPrivateKey(req: AuthRequest, res: Response) {
  const { password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) return sendError(res, 'Wallet not found', 404);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return sendError(res, 'Invalid password', 401);

    const privateKey = decryptPrivateKey(
      user.wallet.encryptedPrivateKey,
      user.wallet.iv,
      user.wallet.authTag,
      user.id
    );

    // Log the export action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        eventType: 'WALLET_KEY_EXPORTED',
        actor: user.id,
        payload: { ip: req.ip, timestamp: new Date().toISOString() },
      },
    });

    return sendSuccess(res, { privateKey, address: user.wallet.address });
  } catch {
    return sendError(res, 'Failed to export key', 500);
  }
}
