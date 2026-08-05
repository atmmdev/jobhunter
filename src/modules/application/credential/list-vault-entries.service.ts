import type {
  CredentialVaultEntryMeta,
  CredentialVaultRepository,
} from '@/modules/domain/credential/credential-vault.repository';

/**
 * Lists vault entry metadata for the current user.
 */
export class ListVaultEntriesService {
  constructor(private readonly vault: CredentialVaultRepository) {}

  async execute(userId: string): Promise<CredentialVaultEntryMeta[]> {
    return this.vault.listEntries(userId);
  }
}
