'use client';

import {
  AE,
  AT,
  AU,
  BE,
  BR,
  CA,
  CH,
  CY,
  CZ,
  DE,
  DK,
  EE,
  ES,
  FI,
  FR,
  GB,
  HU,
  IE,
  IT,
  JP,
  LU,
  NL,
  NO,
  NZ,
  PL,
  PT,
  SE,
  US,
} from 'country-flag-icons/react/3x2';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';

const FLAG_BY_CODE = {
  AE,
  AT,
  AU,
  BE,
  BR,
  CA,
  CH,
  CY,
  CZ,
  DE,
  DK,
  EE,
  ES,
  FI,
  FR,
  GB,
  HU,
  IE,
  IT,
  JP,
  LU,
  NL,
  NO,
  NZ,
  PL,
  PT,
  SE,
  US,
} as const;

type FlagCode = keyof typeof FLAG_BY_CODE;

export interface FocusCountryItem {
  code: string;
  name: string;
  count: number;
  countLabel: string;
}

export interface FocusRegionGroup {
  region: string;
  label: string;
  total: number;
  countries: FocusCountryItem[];
}

interface FocusCountriesGridProps {
  regions: FocusRegionGroup[];
}

/**
 * Renders one card per continent with pill chips: flag | +jobs count.
 */
export function FocusCountriesGrid({ regions }: FocusCountriesGridProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {regions.map((group) => (
          <Card key={group.region} className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="text-muted-foreground uppercase">{group.label}</CardTitle>
              <Badge variant={group.total > 0 ? 'default' : 'outline'}>{group.total}</Badge>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="flex flex-wrap gap-2">
                {group.countries.map((country) => (
                  <li key={country.code}>
                    <FocusCountryPill country={country} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}

function FocusCountryPill({ country }: { country: FocusCountryItem }) {
  const code = country.code.toUpperCase();
  const Flag = isFlagCode(code) ? FLAG_BY_CODE[code] : null;
  const countText = country.count > 0 ? `+${country.count}` : '0';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          aria-label={`${country.name}: ${country.countLabel}`}
          className={cn(
            'inline-flex h-9 items-center overflow-hidden rounded-full border border-border bg-card shadow-sm',
            'cursor-default transition-shadow hover:shadow-md',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          )}
        >
          <span className="flex h-full items-center px-2.5">
            {Flag ? (
              <Flag className="h-4 w-6 rounded-xs object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">{country.code}</span>
            )}
          </span>
          <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
          <span
            className={cn(
              'px-2.5 text-sm font-semibold tracking-tight',
              country.count > 0 ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {countText}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{country.name}</TooltipContent>
    </Tooltip>
  );
}

function isFlagCode(code: string): code is FlagCode {
  return Object.prototype.hasOwnProperty.call(FLAG_BY_CODE, code);
}
