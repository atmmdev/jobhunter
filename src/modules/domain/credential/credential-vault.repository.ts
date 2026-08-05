export interface CredentialVaultEntryMeta {
  provider: string;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Port for encrypted provider secrets (e.g. Playwright storage-state).
 */
export interface CredentialVaultRepository {
  listEntries(userId: string): Promise<CredentialVaultEntryMeta[]>;
  upsertSecret(userId: string, provider: string, plaintext: string): Promise<void>;
  getSecret(userId: string, provider: string): Promise<string | null>;
  deleteSecret(userId: string, provider: string): Promise<void>;
}
