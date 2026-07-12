/**
 * Company aggregate used by the application layer.
 */
export interface CompanyEntity {
  readonly id: string;
  readonly name: string;
  readonly website: string | null;
  readonly careersUrl: string | null;
  readonly country: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
