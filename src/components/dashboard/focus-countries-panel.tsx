import {
  FocusCountriesGrid,
  type FocusRegionGroup,
} from '@/components/dashboard/focus-countries-grid';
import {
  countryNameAliases,
  groupFocusCountriesByRegion,
  localizeCountryName,
  type FocusCountryRegion,
} from '@/modules/domain/analytics/focus-countries';

interface FocusCountriesPanelProps {
  locale: string;
  title: string;
  subtitle: string;
  regionLabels: Record<FocusCountryRegion, string>;
  /** Formats the accessible label for a country job badge. */
  formatCountLabel: (count: number) => string;
  /** Optional job counts keyed by ISO code or free-text country name (case-insensitive). */
  jobCountsByCountry?: Record<string, number>;
}

/**
 * Dashboard section listing relocation / search focus countries grouped in
 * one card per continent.
 */
export function FocusCountriesPanel({
  locale,
  title,
  subtitle,
  regionLabels,
  formatCountLabel,
  jobCountsByCountry = {},
}: FocusCountriesPanelProps) {
  const countLookup = buildCountLookup(jobCountsByCountry);

  const regions: FocusRegionGroup[] = groupFocusCountriesByRegion().map((group) => {
    const countries = group.countries.map((country) => {
      const name = localizeCountryName(country.code, locale);
      const count = resolveJobCount(country.code, name, countLookup);
      return {
        code: country.code,
        name,
        count,
        countLabel: formatCountLabel(count),
      };
    });

    return {
      region: group.region,
      label: regionLabels[group.region],
      total: countries.reduce((sum, country) => sum + country.count, 0),
      countries,
    };
  });

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{subtitle}</p>
      </header>
      <FocusCountriesGrid regions={regions} />
    </section>
  );
}

function buildCountLookup(raw: Record<string, number>): Map<string, number> {
  const map = new Map<string, number>();
  for (const [key, value] of Object.entries(raw)) {
    const normalized = key.trim().toLowerCase();
    if (!normalized) {
      continue;
    }
    map.set(normalized, (map.get(normalized) ?? 0) + value);
  }
  return map;
}

function resolveJobCount(
  code: string,
  localizedName: string,
  lookup: Map<string, number>,
): number {
  const aliases = [code, localizedName, ...countryNameAliases(code)];
  for (const alias of aliases) {
    const hit = lookup.get(alias.trim().toLowerCase());
    if (hit !== undefined) {
      return hit;
    }
  }
  return 0;
}
