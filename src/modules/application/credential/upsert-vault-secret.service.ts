import type { CredentialVaultRepository } from '@/modules/domain/credential/credential-vault.repository';
import { DomainError } from '@/modules/domain/shared/errors';
import type { CredentialCrypto } from '@/modules/infrastructure/security/credential-crypto';
import type { UpsertVaultSecretDto } from '@/shared/schemas/credential-vault.schema';

/**
 * Encrypts and stores a Playwright storage-state (or similar) secret.
 */
export class UpsertVaultSecretService {
  constructor(
    private readonly vault: CredentialVaultRepository,
    private readonly crypto: CredentialCrypto,
  ) {}

  async execute(userId: string, input: UpsertVaultSecretDto): Promise<{ provider: string }> {
    if (!this.crypto.isConfigured()) {
      throw new DomainError(
        'ENCRYPTION_NOT_CONFIGURED',
        'Set ENCRYPTION_KEY (64-char hex) before saving vault secrets',
      );
    }
    await this.vault.upsertSecret(userId, input.provider, input.storageStateJson);
    return { provider: input.provider };
  }
}
