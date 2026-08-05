import type { CredentialVaultRepository } from '@/modules/domain/credential/credential-vault.repository';
import type { DeleteVaultSecretDto } from '@/shared/schemas/credential-vault.schema';

/**
 * Deletes a vaulted provider secret.
 */
export class DeleteVaultSecretService {
  constructor(private readonly vault: CredentialVaultRepository) {}

  async execute(userId: string, input: DeleteVaultSecretDto): Promise<{ provider: string }> {
    await this.vault.deleteSecret(userId, input.provider);
    return { provider: input.provider };
  }
}
