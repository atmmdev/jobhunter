import {
  countryCodeToFlagEmoji,
  countryNameAliases,
  groupFocusCountriesByRegion,
  localizeCountryName,
  type FocusCountryRegion,
} from '@/modules/domain/analytics/focus-countries';
import { cn } from '@/shared/lib/utils';

interface FocusCountriesPanelProps {
  locale: string;
  title: string;
  subtitle: string;
  regionLabels: Record<FocusCountryRegion, string>;
  /** Optional job counts keyed by ISO code or free-text country name (case-insensitive). */
  jobCountsByCountry?: Record<string, number>;
}

/**
 * Dashboard panel listing relocation / search focus countries by region.
 */
export function FocusCountriesPanel({
  locale,
  title,
  subtitle,
  regionLabels,
  jobCountsByCountry = {},
}: FocusCountriesPanelProps) {
  const groups = groupFocusCountriesByRegion();
  const countLookup = buildCountLookup(jobCountsByCountry);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.region} className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {regionLabels[group.region]}
            </p>
            <ul className="flex flex-wrap gap-2">
              {group.countries.map((country) => {
                const name = localizeCountryName(country.code, locale);
                const flag = countryCodeToFlagEmoji(country.code);
                const count = resolveJobCount(country.code, name, countLookup);
                const hasJobs = count > 0;

                return (
                  <li key={country.code}>
                    <span
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
                        hasJobs
                          ? 'border-sky-500/80 bg-sky-500/10 text-foreground'
                          : 'border-border bg-background text-foreground',
                      )}
                      title={hasJobs ? `${name}: ${count}` : name}
                    >
                      <span aria-hidden className="text-base leading-none">
                        {flag}
                      </span>
                      <span>{name}</span>
                      {hasJobs ? (
                        <span className="text-xs text-muted-foreground">({count})</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
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
