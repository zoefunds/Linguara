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
