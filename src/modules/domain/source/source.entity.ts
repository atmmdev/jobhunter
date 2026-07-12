/**
 * Source aggregate subset needed for manual job entry.
 */
export interface SourceEntity {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly enabled: boolean;
}

export const MANUAL_SOURCE_NAME = 'Manual Entry';
export const MANUAL_SOURCE_URL = 'manual://entry';
