import type { AtsTypeValue } from '@/modules/domain/ats/ats-type';
import type { SourceTypeValue } from '@/modules/domain/company/company-seed.repository';

/**
 * JSON-safe source DTO for Client Components.
 */
export interface SourceListItemDto {
  id: string;
  name: string;
  type: SourceTypeValue;
  atsType: AtsTypeValue | null;
  baseUrl: string;
  enabled: boolean;
  companyName: string | null;
  country: string | null;
  lastRunAt: string | null;
  lastStatus: string | null;
  createdAt: string;
}

/**
 * Maps a source list row to a serializable DTO.
 */
export function toSourceListItemDto(source: {
  id: string;
  name: string;
  type: SourceTypeValue;
  atsType: AtsTypeValue | null;
  baseUrl: string;
  enabled: boolean;
  companyName: string | null;
  country: string | null;
  lastRunAt: Date | null;
  lastStatus: string | null;
  createdAt: Date;
}): SourceListItemDto {
  return {
    id: source.id,
    name: source.name,
    type: source.type,
    atsType: source.atsType,
    baseUrl: source.baseUrl,
    enabled: source.enabled,
    companyName: source.companyName,
    country: source.country,
    lastRunAt: source.lastRunAt?.toISOString() ?? null,
    lastStatus: source.lastStatus,
    createdAt: source.createdAt.toISOString(),
  };
}
