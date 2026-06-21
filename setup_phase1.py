#!/usr/bin/env python3
"""Phase 1 — Linguara project scaffold: directories, backend, frontend skeleton, Docker, Git config."""

import os, json

ROOT = "/Users/macbook/Linguara"

def mkdirs(*paths):
    for p in paths:
        os.makedirs(p, exist_ok=True)

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"  ✓ {path.replace(ROOT+'/', '')}")

print("\n── Phase 1: Project Scaffold ──\n")

# ─────────────────────────────────────────
# DIRECTORY STRUCTURE
# ─────────────────────────────────────────
mkdirs(
    f"{ROOT}/backend/src/controllers",
    f"{ROOT}/backend/src/middleware",
    f"{ROOT}/backend/src/routes",
    f"{ROOT}/backend/src/services",
    f"{ROOT}/backend/src/utils",
    f"{ROOT}/backend/src/types",
    f"{ROOT}/backend/src/config",
    f"{ROOT}/backend/prisma",
    f"{ROOT}/backend/uploads",
    f"{ROOT}/frontend/src/app/(auth)/login",
    f"{ROOT}/frontend/src/app/(auth)/register",
    f"{ROOT}/frontend/src/app/(auth)/forgot-password",
    f"{ROOT}/frontend/src/app/(dashboard)/translate",
    f"{ROOT}/frontend/src/app/(dashboard)/documents",
    f"{ROOT}/frontend/src/app/(dashboard)/history",
    f"{ROOT}/frontend/src/app/(dashboard)/audit",
    f"{ROOT}/frontend/src/app/(dashboard)/wallet",
    f"{ROOT}/frontend/src/app/(dashboard)/settings",
    f"{ROOT}/frontend/src/app/(dashboard)/reports",
    f"{ROOT}/frontend/src/components/ui",
    f"{ROOT}/frontend/src/components/layout",
    f"{ROOT}/frontend/src/components/landing",
    f"{ROOT}/frontend/src/components/dashboard",
    f"{ROOT}/frontend/src/components/translation",
    f"{ROOT}/frontend/src/lib",
    f"{ROOT}/frontend/src/hooks",
    f"{ROOT}/frontend/src/store",
    f"{ROOT}/frontend/src/types",
    f"{ROOT}/frontend/messages",
    f"{ROOT}/frontend/public/fonts",
    f"{ROOT}/contracts",
    f"{ROOT}/.github/workflows",
)

# ─────────────────────────────────────────
# ROOT FILES
# ─────────────────────────────────────────
write(f"{ROOT}/.gitignore", """\
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
.next/
dist/
build/
out/

# Environment
.env
.env.local
.env.production
.env.staging
*.env

# Database
*.db
*.sqlite

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Docker
.docker/

# Uploads
backend/uploads/*
!backend/uploads/.gitkeep

# Prisma
backend/prisma/migrations/

# Coverage
coverage/
.nyc_output/
""")

write(f"{ROOT}/backend/uploads/.gitkeep", "")

write(f"{ROOT}/docker-compose.yml", """\
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: linguara_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-linguara}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-linguara_secret}
      POSTGRES_DB: ${POSTGRES_DB:-linguara_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U linguara"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
""")

# ─────────────────────────────────────────
# BACKEND
# ─────────────────────────────────────────
write(f"{ROOT}/backend/package.json", json.dumps({
    "name": "linguara-backend",
    "version": "1.0.0",
    "description": "Linguara API Server",
    "main": "dist/index.js",
    "scripts": {
        "dev": "tsx watch src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js",
        "db:generate": "prisma generate",
        "db:migrate": "prisma migrate deploy",
        "db:push": "prisma db push",
        "db:studio": "prisma studio",
        "db:seed": "tsx prisma/seed.ts"
    },
    "dependencies": {
        "@getbrevo/brevo": "^2.0.0",
        "@prisma/client": "^5.10.0",
        "bcryptjs": "^2.4.3",
        "compression": "^1.7.4",
        "cookie-parser": "^1.4.6",
        "cors": "^2.8.5",
        "dotenv": "^16.4.5",
        "ethers": "^6.11.1",
        "express": "^4.18.3",
        "express-rate-limit": "^7.2.0",
        "express-validator": "^7.0.1",
        "helmet": "^7.1.0",
        "ioredis": "^5.3.2",
        "jsonwebtoken": "^9.0.2",
        "morgan": "^1.10.0",
        "multer": "^1.4.5-lts.1",
        "sharp": "^0.33.3",
        "tesseract.js": "^5.0.5",
        "uuid": "^9.0.1",
        "winston": "^3.12.0",
        "zod": "^3.22.4"
    },
    "devDependencies": {
        "@types/bcryptjs": "^2.4.6",
        "@types/compression": "^1.7.5",
        "@types/cookie-parser": "^1.4.7",
        "@types/cors": "^2.8.17",
        "@types/express": "^4.17.21",
        "@types/jsonwebtoken": "^9.0.6",
        "@types/morgan": "^1.9.9",
        "@types/multer": "^1.4.11",
        "@types/node": "^20.11.30",
        "@types/uuid": "^9.0.8",
        "prisma": "^5.10.0",
        "tsx": "^4.7.1",
        "typescript": "^5.4.3"
    }
}, indent=2))

write(f"{ROOT}/backend/tsconfig.json", """\
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
""")

write(f"{ROOT}/backend/.env.example", """\
# Server
NODE_ENV=development
PORT=4000
API_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://linguara:linguara_secret@localhost:5432/linguara_db

# Redis (Upstash)
REDIS_URL=rediss://default:...@....upstash.io:6379

# JWT
JWT_ACCESS_SECRET=change_me_access_secret_min_64_chars_random
JWT_REFRESH_SECRET=change_me_refresh_secret_min_64_chars_random
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Wallet Encryption
WALLET_MASTER_KEY=change_me_32_byte_hex_string_exactly_64_chars

# Brevo Email
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=preciousmofeoluwa@gmail.com
BREVO_FROM_NAME=Linguara

# Frontend URL (for CORS + email links)
FRONTEND_URL=http://localhost:3000

# GenLayer
GENLAYER_RPC_URL=https://studio.genlayer.com/api
GENLAYER_CONTRACT_ADDRESS=
GENLAYER_PRIVATE_KEY=

# File Storage (Tigris / S3-compatible)
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=linguara-uploads
S3_REGION=auto
""")

# ─────────────────────────────────────────
# PRISMA SCHEMA
# ─────────────────────────────────────────
write(f"{ROOT}/backend/prisma/schema.prisma", """\
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserPlan {
  FREE
  PRO
  ENTERPRISE
}

enum TranslationStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum DocumentType {
  TEXT
  DOCUMENT
  IMAGE
}

model User {
  id                String        @id @default(uuid())
  email             String        @unique
  passwordHash      String        @map("password_hash")
  fullName          String        @map("full_name")
  preferredLanguage String        @default("en") @map("preferred_language")
  plan              UserPlan      @default(FREE)
  emailVerified     Boolean       @default(false) @map("email_verified")
  emailVerifyToken  String?       @map("email_verify_token")
  resetPasswordToken String?      @map("reset_password_token")
  resetPasswordExpiry DateTime?   @map("reset_password_expiry")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  wallet            Wallet?
  translations      Translation[]
  auditLogs         AuditLog[]

  @@map("users")
}

model Wallet {
  id                 String   @id @default(uuid())
  userId             String   @unique @map("user_id")
  address            String   @unique
  encryptedPrivateKey String  @map("encrypted_private_key")
  iv                 String
  authTag            String   @map("auth_tag")
  createdAt          DateTime @default(now()) @map("created_at")

  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("wallets")
}

model Translation {
  id              String            @id @default(uuid())
  userId          String            @map("user_id")
  sourceText      String            @map("source_text") @db.Text
  sourceLanguage  String            @map("source_language")
  targetLanguage  String            @map("target_language")
  documentType    DocumentType      @default(TEXT) @map("document_type")
  fileUrl         String?           @map("file_url")
  fileName        String?           @map("file_name")
  status          TranslationStatus @default(PENDING)
  domain          String            @default("general")
  contractTxHash  String?           @map("contract_tx_hash")
  finalTranslation String?          @map("final_translation") @db.Text
  confidenceScore Float?            @map("confidence_score")
  createdAt       DateTime          @default(now()) @map("created_at")
  completedAt     DateTime?         @map("completed_at")

  user            User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  results         TranslationResult[]
  auditLogs       AuditLog[]

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("translations")
}

model TranslationResult {
  id              String   @id @default(uuid())
  translationId   String   @map("translation_id")
  agentId         Int      @map("agent_id")
  translatedText  String   @map("translated_text") @db.Text
  confidenceScore Float    @map("confidence_score")
  semanticScore   Float    @map("semantic_score")
  toneScore       Float    @map("tone_score")
  culturalScore   Float    @map("cultural_score")
  isConsensus     Boolean  @default(false) @map("is_consensus")
  metadata        Json?
  createdAt       DateTime @default(now()) @map("created_at")

  translation     Translation @relation(fields: [translationId], references: [id], onDelete: Cascade)

  @@index([translationId])
  @@map("translation_results")
}

model AuditLog {
  id            String   @id @default(uuid())
  translationId String?  @map("translation_id")
  userId        String?  @map("user_id")
  eventType     String   @map("event_type")
  actor         String
  payload       Json?
  onChainRef    String?  @map("on_chain_ref")
  createdAt     DateTime @default(now()) @map("created_at")

  translation   Translation? @relation(fields: [translationId], references: [id], onDelete: SetNull)
  user          User?        @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([translationId])
  @@index([userId])
  @@index([createdAt])
  @@map("audit_logs")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("refresh_tokens")
}
""")

# ─────────────────────────────────────────
# BACKEND CONFIG
# ─────────────────────────────────────────
write(f"{ROOT}/backend/src/config/env.ts", """\
import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000'),
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  db: {
    url: required('DATABASE_URL'),
  },

  redis: {
    url: required('REDIS_URL'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  wallet: {
    masterKey: required('WALLET_MASTER_KEY'),
  },

  brevo: {
    apiKey: required('BREVO_API_KEY'),
    fromEmail: process.env.BREVO_FROM_EMAIL || 'preciousmofeoluwa@gmail.com',
    fromName: process.env.BREVO_FROM_NAME || 'Linguara',
  },

  genLayer: {
    rpcUrl: process.env.GENLAYER_RPC_URL || 'https://studio.genlayer.com/api',
    contractAddress: process.env.GENLAYER_CONTRACT_ADDRESS || '',
    privateKey: process.env.GENLAYER_PRIVATE_KEY || '',
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    bucket: process.env.S3_BUCKET || 'linguara-uploads',
    region: process.env.S3_REGION || 'auto',
  },
} as const;
""")

write(f"{ROOT}/backend/src/config/database.ts", """\
import { PrismaClient } from '@prisma/client';
import { config } from './env';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma || new PrismaClient({
  log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (config.env !== 'production') {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.log('✓ PostgreSQL connected');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
""")

write(f"{ROOT}/backend/src/config/redis.ts", """\
import Redis from 'ioredis';
import { config } from './env';

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  tls: config.redis.url.startsWith('rediss://') ? {} : undefined,
});

redis.on('connect', () => console.log('✓ Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err.message));

export const CACHE_TTL = {
  SESSION: 60 * 60 * 24 * 7,   // 7 days
  RATE_LIMIT: 60 * 15,          // 15 min
  TRANSLATION: 60 * 60,         // 1 hour
} as const;
""")

write(f"{ROOT}/backend/src/config/logger.ts", """\
import winston from 'winston';
import { config } from './env';

export const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    config.env === 'production'
      ? winston.format.json()
      : winston.format.colorize({ all: true }),
    config.env === 'production'
      ? winston.format.simple()
      : winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
  ),
  transports: [
    new winston.transports.Console(),
    ...(config.env === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ] : []),
  ],
});
""")

# ─────────────────────────────────────────
# BACKEND UTILS
# ─────────────────────────────────────────
write(f"{ROOT}/backend/src/utils/wallet.ts", """\
import { ethers } from 'ethers';
import crypto from 'crypto';
import { config } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;

function deriveKey(userId: string): Buffer {
  const masterKey = Buffer.from(config.wallet.masterKey, 'hex');
  return crypto.pbkdf2Sync(masterKey, userId, 100_000, KEY_LENGTH, 'sha256');
}

export interface WalletData {
  address: string;
  encryptedPrivateKey: string;
  iv: string;
  authTag: string;
}

export function generateWallet(userId: string): WalletData {
  const wallet = ethers.Wallet.createRandom();
  const key = deriveKey(userId);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(wallet.privateKey, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    address: wallet.address,
    encryptedPrivateKey: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decryptPrivateKey(
  encryptedPrivateKey: string,
  iv: string,
  authTag: string,
  userId: string
): string {
  const key = deriveKey(userId);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPrivateKey, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
""")

write(f"{ROOT}/backend/src/utils/jwt.ts", """\
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires as any,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires as any,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
}
""")

write(f"{ROOT}/backend/src/utils/response.ts", """\
import { Response } from 'express';

export const sendSuccess = (res: Response, data: unknown, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

export const sendError = (res: Response, message: string, statusCode = 400, errors?: unknown) => {
  res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });
};

export const sendPaginated = (
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
) => {
  res.status(200).json({
    success: true,
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};
""")

# ─────────────────────────────────────────
# BACKEND MIDDLEWARE
# ─────────────────────────────────────────
write(f"{ROOT}/backend/src/middleware/auth.ts", """\
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
}
""")

write(f"{ROOT}/backend/src/middleware/rateLimit.ts", """\
import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis';

const redisStore = {
  sendCommand: (...args: string[]) => (redis as any).call(...args),
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const translationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Translation rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});
""")

write(f"{ROOT}/backend/src/middleware/validate.ts", """\
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response';

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }
  next();
}
""")

write(f"{ROOT}/backend/src/middleware/errorHandler.ts", """\
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { sendError } from '../utils/response';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (res.headersSent) return next(err);

  const statusCode = (err as any).statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  sendError(res, message, statusCode);
}

export function notFound(req: Request, res: Response) {
  sendError(res, `Route ${req.path} not found`, 404);
}
""")

# ─────────────────────────────────────────
# BACKEND SERVICES
# ─────────────────────────────────────────
write(f"{ROOT}/backend/src/services/email.service.ts", """\
import * as Brevo from '@getbrevo/brevo';
import { config } from '../config/env';
import { logger } from '../config/logger';

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevo.apiKey);

interface SendEmailOptions {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
}

async function sendEmail({ to, toName, subject, htmlContent }: SendEmailOptions) {
  try {
    const email = new Brevo.SendSmtpEmail();
    email.sender = { name: config.brevo.fromName, email: config.brevo.fromEmail };
    email.to = [{ email: to, name: toName }];
    email.subject = subject;
    email.htmlContent = htmlContent;
    await apiInstance.sendTransacEmail(email);
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error('Failed to send email', { err, to, subject });
    throw err;
  }
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${config.frontendUrl}/auth/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    toName: name,
    subject: 'Verify your Linguara account',
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h1 style="color:#6366f1;">Welcome to Linguara</h1>
        <p>Hi ${name}, please verify your email address to activate your account.</p>
        <a href="${link}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:12px;">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${config.frontendUrl}/auth/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    toName: name,
    subject: 'Reset your Linguara password',
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h1 style="color:#6366f1;">Password Reset</h1>
        <p>Hi ${name}, click below to reset your password.</p>
        <a href="${link}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:12px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendTranslationCompleteEmail(
  email: string,
  name: string,
  translationId: string,
  confidence: number
) {
  const link = `${config.frontendUrl}/dashboard/history/${translationId}`;
  await sendEmail({
    to: email,
    toName: name,
    subject: 'Your translation is ready — Linguara',
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h1 style="color:#6366f1;">Translation Complete</h1>
        <p>Hi ${name}, your translation has been verified with a confidence score of <strong>${confidence.toFixed(1)}%</strong>.</p>
        <a href="${link}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;">
          View Translation
        </a>
      </div>
    `,
  });
}
""")

write(f"{ROOT}/backend/src/services/genLayer.service.ts", """\
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

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    logger.info('GenLayer contract called', { txHash: result.result });

    // Poll for result
    return await pollForResult(result.result);
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

      const { result } = await response.json();
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
""")

# ─────────────────────────────────────────
# BACKEND CONTROLLERS
# ─────────────────────────────────────────
write(f"{ROOT}/backend/src/controllers/auth.controller.ts", """\
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
""")

write(f"{ROOT}/backend/src/controllers/translation.controller.ts", """\
import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { callGenLayerContract } from '../services/genLayer.service';
import { sendTranslationCompleteEmail } from '../services/email.service';
import { logger } from '../config/logger';

export async function createTranslation(req: AuthRequest, res: Response) {
  const { sourceText, targetLanguage, sourceLanguage, domain, documentType } = req.body;

  try {
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

    await prisma.auditLog.create({
      data: {
        translationId: translation.id,
        userId: req.user!.userId,
        eventType: 'TRANSLATION_CREATED',
        actor: req.user!.userId,
        payload: { targetLanguage, domain },
      },
    });

    // Process asynchronously
    processTranslation(translation.id, req.user!.userId).catch(err =>
      logger.error('Translation processing error', { err, translationId: translation.id })
    );

    return sendSuccess(res, { translationId: translation.id, status: 'PENDING' }, 202);
  } catch (err) {
    logger.error('Create translation error', { err });
    return sendError(res, 'Failed to create translation', 500);
  }
}

async function processTranslation(translationId: string, userId: string) {
  const translation = await prisma.translation.findUnique({ where: { id: translationId } });
  if (!translation) return;

  await prisma.translation.update({
    where: { id: translationId },
    data: { status: 'PROCESSING' },
  });

  await prisma.auditLog.create({
    data: {
      translationId,
      userId,
      eventType: 'TRANSLATION_PROCESSING_STARTED',
      actor: 'system',
      payload: {},
    },
  });

  try {
    const result = await callGenLayerContract(
      translation.sourceText,
      translation.sourceLanguage,
      translation.targetLanguage,
      translation.domain
    );

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
        payload: {
          confidenceScore: result.confidenceScore,
          txHash: result.txHash,
        },
        onChainRef: result.txHash,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendTranslationCompleteEmail(
        user.email,
        user.fullName,
        translationId,
        result.confidenceScore
      );
    }
  } catch (err) {
    await prisma.translation.update({
      where: { id: translationId },
      data: { status: 'FAILED' },
    });
    await prisma.auditLog.create({
      data: {
        translationId,
        userId,
        eventType: 'TRANSLATION_FAILED',
        actor: 'system',
        payload: { error: String(err) },
      },
    });
    throw err;
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
""")

# ─────────────────────────────────────────
# BACKEND ROUTES
# ─────────────────────────────────────────
write(f"{ROOT}/backend/src/routes/auth.routes.ts", """\
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import * as auth from '../controllers/auth.controller';

const router = Router();

router.post('/register', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name required'),
], validate, auth.register);

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, auth.login);

router.post('/refresh', auth.refreshToken);
router.post('/logout', authenticate, auth.logout);
router.get('/verify-email', auth.verifyEmail);
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail(),
], validate, auth.forgotPassword);
router.post('/reset-password', authLimiter, [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], validate, auth.resetPassword);
router.get('/me', authenticate, auth.getMe);
router.post('/export-key', authenticate, [
  body('password').notEmpty(),
], validate, auth.exportPrivateKey);

export default router;
""")

write(f"{ROOT}/backend/src/routes/translation.routes.ts", """\
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { translationLimiter } from '../middleware/rateLimit';
import * as translation from '../controllers/translation.controller';

const router = Router();

router.use(authenticate);

router.post('/', translationLimiter, [
  body('sourceText').trim().isLength({ min: 1, max: 50000 }),
  body('targetLanguage').trim().isLength({ min: 2, max: 10 }),
  body('domain').optional().isIn(['general', 'legal', 'medical', 'technical', 'financial', 'government']),
  body('documentType').optional().isIn(['TEXT', 'DOCUMENT', 'IMAGE']),
], validate, translation.createTranslation);

router.get('/', translation.listTranslations);
router.get('/audit', translation.getAuditLog);
router.get('/:id', translation.getTranslation);

export default router;
""")

write(f"{ROOT}/backend/src/routes/index.ts", """\
import { Router } from 'express';
import authRoutes from './auth.routes';
import translationRoutes from './translation.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Linguara API' });
});

router.use('/auth', authRoutes);
router.use('/translations', translationRoutes);

export default router;
""")

# ─────────────────────────────────────────
# BACKEND ENTRY POINT
# ─────────────────────────────────────────
write(f"{ROOT}/backend/src/index.ts", """\
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { redis } from './config/redis';
import { logger } from './config/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  try {
    await connectDatabase();
    logger.info(`✓ Redis: ${redis.status}`);

    const server = app.listen(config.port, () => {
      logger.info(`✓ Linguara API running on port ${config.port} [${config.env}]`);
    });

    const shutdown = async () => {
      logger.info('Shutting down...');
      server.close(async () => {
        await disconnectDatabase();
        await redis.quit();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Bootstrap failed', { err });
    process.exit(1);
  }
}

bootstrap();
""")

# ─────────────────────────────────────────
# BACKEND DOCKERFILE
# ─────────────────────────────────────────
write(f"{ROOT}/backend/Dockerfile", """\
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S linguara -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
USER linguara
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
""")

write(f"{ROOT}/backend/.dockerignore", """\
node_modules
dist
.env
*.log
uploads/*
""")

# ─────────────────────────────────────────
# FLY.IO CONFIG
# ─────────────────────────────────────────
write(f"{ROOT}/backend/fly.toml", """\
app = 'linguara-api'
primary_region = 'lax'

[build]
  dockerfile = 'Dockerfile'

[env]
  NODE_ENV = 'production'
  PORT = '4000'

[http_service]
  internal_port = 4000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

  [http_service.concurrency]
    type = 'connections'
    hard_limit = 200
    soft_limit = 150

[[vm]]
  memory = '512mb'
  cpu_kind = 'shared'
  cpus = 1

[mounts]
  source = 'linguara_data'
  destination = '/app/uploads'
""")

print("\n✓ Backend scaffold complete\n")

# ─────────────────────────────────────────
# FRONTEND package.json
# ─────────────────────────────────────────
write(f"{ROOT}/frontend/package.json", json.dumps({
    "name": "linguara-frontend",
    "version": "1.0.0",
    "private": True,
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "type-check": "tsc --noEmit"
    },
    "dependencies": {
        "next": "14.2.3",
        "react": "^18.3.0",
        "react-dom": "^18.3.0",
        "next-intl": "^3.12.0",
        "next-themes": "^0.3.0",
        "@radix-ui/react-alert-dialog": "^1.0.5",
        "@radix-ui/react-avatar": "^1.0.4",
        "@radix-ui/react-dialog": "^1.0.5",
        "@radix-ui/react-dropdown-menu": "^2.0.6",
        "@radix-ui/react-label": "^2.0.2",
        "@radix-ui/react-progress": "^1.0.3",
        "@radix-ui/react-scroll-area": "^1.0.5",
        "@radix-ui/react-select": "^2.0.0",
        "@radix-ui/react-separator": "^1.0.3",
        "@radix-ui/react-slot": "^1.0.2",
        "@radix-ui/react-tabs": "^1.0.4",
        "@radix-ui/react-toast": "^1.1.5",
        "@radix-ui/react-tooltip": "^1.0.7",
        "@tanstack/react-query": "^5.28.6",
        "axios": "^1.6.8",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.1.0",
        "framer-motion": "^11.1.1",
        "lucide-react": "^0.368.0",
        "react-dropzone": "^14.2.3",
        "react-hook-form": "^7.51.2",
        "tailwind-merge": "^2.2.2",
        "tailwindcss-animate": "^1.0.7",
        "zustand": "^4.5.2",
        "zod": "^3.22.4",
        "@hookform/resolvers": "^3.3.4",
        "recharts": "^2.12.3",
        "js-cookie": "^3.0.5"
    },
    "devDependencies": {
        "@types/node": "^20.11.30",
        "@types/react": "^18.2.73",
        "@types/react-dom": "^18.2.23",
        "@types/js-cookie": "^3.0.6",
        "autoprefixer": "^10.4.19",
        "eslint": "^8.57.0",
        "eslint-config-next": "14.2.3",
        "postcss": "^8.4.38",
        "tailwindcss": "^3.4.3",
        "typescript": "^5.4.3"
    }
}, indent=2))

write(f"{ROOT}/frontend/tsconfig.json", """\
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""")

write(f"{ROOT}/frontend/next.config.mjs", """\
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
""")

write(f"{ROOT}/frontend/tailwind.config.ts", """\
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        indigo: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
""")

write(f"{ROOT}/frontend/postcss.config.mjs", """\
/** @type {import('postcss').Config} */
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
""")

write(f"{ROOT}/frontend/.env.local.example", """\
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GENLAYER_EXPLORER=https://studio.genlayer.com
""")

# ─────────────────────────────────────────
# GITHUB ACTIONS
# ─────────────────────────────────────────
write(f"{ROOT}/.github/workflows/deploy.yml", """\
name: Deploy Linguara

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: |
            backend/package-lock.json
            frontend/package-lock.json

      - name: Backend type check
        working-directory: backend
        run: npm ci && npx tsc --noEmit

      - name: Frontend type check
        working-directory: frontend
        run: npm ci && npx tsc --noEmit

  deploy-backend:
    name: Deploy Backend to Fly.io
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - name: Deploy to Fly.io
        working-directory: backend
        run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
""")

# ─────────────────────────────────────────
# VERCEL CONFIG
# ─────────────────────────────────────────
write(f"{ROOT}/frontend/vercel.json", """\
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@linguara_api_url",
    "NEXT_PUBLIC_APP_URL": "https://linguara.vercel.app"
  }
}
""")

print("\n✓ All Phase 1 files created\n")
print("Next: run the install commands shown in the terminal output.")
