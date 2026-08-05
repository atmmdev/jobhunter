import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
}

/**
 * AES-256-GCM helpers for CredentialVault storage-state secrets.
 */
export class CredentialCrypto {
  constructor(private readonly keyHex = process.env.ENCRYPTION_KEY ?? '') {}

  /**
   * Returns true when ENCRYPTION_KEY is a 32-byte hex string.
   */
  isConfigured(): boolean {
    return /^[0-9a-fA-F]{64}$/.test(this.keyHex);
  }

  /**
   * Encrypts UTF-8 plaintext. Throws if ENCRYPTION_KEY is missing/invalid.
   */
  encrypt(plaintext: string): EncryptedPayload {
    const key = this.requireKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      ciphertext: Buffer.concat([encrypted, tag]).toString('base64'),
      iv: iv.toString('base64'),
    };
  }

  /**
   * Decrypts a CredentialVault payload.
   */
  decrypt(payload: EncryptedPayload): string {
    const key = this.requireKey();
    const iv = Buffer.from(payload.iv, 'base64');
    const data = Buffer.from(payload.ciphertext, 'base64');
    const tag = data.subarray(data.length - 16);
    const encrypted = data.subarray(0, data.length - 16);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  private requireKey(): Buffer {
    if (!this.isConfigured()) {
      throw new Error(
        'ENCRYPTION_KEY must be a 64-char hex string (openssl rand -hex 32)',
      );
    }
    return Buffer.from(this.keyHex, 'hex');
  }
}
