export type ResumeStackValue = 'JS_TS' | 'DOTNET' | 'PHP' | 'OTHER';

/**
 * Resume aggregate used by the application layer.
 */
export interface ResumeEntity {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly stack: ResumeStackValue;
  readonly summary: string | null;
  readonly contentText: string;
  readonly filePath: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
