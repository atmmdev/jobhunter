import type { CredentialCrypto, EncryptedPayload } from '@/modules/infrastructure/security/credential-crypto';
import { prisma } from '@/modules/infrastructure/prisma/client';

/**
 * Persists encrypted provider credentials / Playwright storage-state JSON.
 */
export class PrismaCredentialVaultRepository {
  constructor(private readonly crypto: CredentialCrypto) {}

  /**
   * Upserts encrypted secret for a user + provider key (e.g. `linkedin`, `indeed`).
   */
  async upsertSecret(userId: string, provider: string, plaintext: string): Promise<void> {
    const encrypted = this.crypto.encrypt(plaintext);
    await prisma.credentialVault.upsert({
      where: { userId_provider: { userId, provider } },
      create: {
        userId,
        provider,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
      },
      update: {
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
      },
    });
  }

  /**
   * Reads and decrypts a provider secret, or null when missing.
   */
  async getSecret(userId: string, provider: string): Promise<string | null> {
    const row = await prisma.credentialVault.findUnique({
      where: { userId_provider: { userId, provider } },
    });
    if (!row) {
      return null;
    }
    const payload: EncryptedPayload = { ciphertext: row.ciphertext, iv: row.iv };
    return this.crypto.decrypt(payload);
  }

  /**
   * Deletes a stored provider secret.
   */
  async deleteSecret(userId: string, provider: string): Promise<void> {
    await prisma.credentialVault.deleteMany({ where: { userId, provider } });
  }
}
