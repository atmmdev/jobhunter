/**
 * ISO 3166-1 alpha-2 regions the operator prioritizes for relocation / remote focus.
 */
export type FocusCountryRegion =
  | 'europe'
  | 'oceania'
  | 'northAmerica'
  | 'southAmerica'
  | 'asia'
  | 'middleEast';

export interface FocusCountry {
  code: string;
  region: FocusCountryRegion;
}

/**
 * Target countries shown on the Dashboard as relocation / job-search focus.
 * Includes Brazil in addition to the Relocate.me-style shortlist.
 */
export const FOCUS_COUNTRIES: readonly FocusCountry[] = [
  // Europe
  { code: 'DE', region: 'europe' },
  { code: 'GB', region: 'europe' },
  { code: 'ES', region: 'europe' },
  { code: 'BE', region: 'europe' },
  { code: 'FI', region: 'europe' },
  { code: 'EE', region: 'europe' },
  { code: 'PL', region: 'europe' },
  { code: 'AT', region: 'europe' },
  { code: 'DK', region: 'europe' },
  { code: 'FR', region: 'europe' },
  { code: 'CY', region: 'europe' },
  { code: 'CZ', region: 'europe' },
  { code: 'IT', region: 'europe' },
  { code: 'IE', region: 'europe' },
  { code: 'HU', region: 'europe' },
  { code: 'PT', region: 'europe' },
  { code: 'CH', region: 'europe' },
  { code: 'SE', region: 'europe' },
  { code: 'NO', region: 'europe' },
  { code: 'NL', region: 'europe' },
  { code: 'LU', region: 'europe' },
  // Oceania
  { code: 'AU', region: 'oceania' },
  { code: 'NZ', region: 'oceania' },
  // North America
  { code: 'CA', region: 'northAmerica' },
  { code: 'US', region: 'northAmerica' },
  // South America
  { code: 'BR', region: 'southAmerica' },
  // Asia
  { code: 'JP', region: 'asia' },
  // Middle East
  { code: 'AE', region: 'middleEast' },
] as const;

export const FOCUS_COUNTRY_REGIONS: readonly FocusCountryRegion[] = [
  'europe',
  'oceania',
  'northAmerica',
  'southAmerica',
  'asia',
  'middleEast',
] as const;

/**
 * Groups focus countries by region, preserving declaration order.
 */
export function groupFocusCountriesByRegion(): Array<{
  region: FocusCountryRegion;
  countries: readonly FocusCountry[];
}> {
  return FOCUS_COUNTRY_REGIONS.map((region) => ({
    region,
    countries: FOCUS_COUNTRIES.filter((country) => country.region === region),
  })).filter((group) => group.countries.length > 0);
}

/**
 * Converts an ISO 3166-1 alpha-2 code to a regional-indicator flag emoji.
 */
export function countryCodeToFlagEmoji(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return '';
  }
  const offset = 0x1f1e6 - 65;
  return String.fromCodePoint(
    normalized.charCodeAt(0) + offset,
    normalized.charCodeAt(1) + offset,
  );
}

/**
 * Localizes a country code with Intl.DisplayNames (falls back to the code).
 */
export function localizeCountryName(code: string, locale: string): string {
  try {
    const name = new Intl.DisplayNames([locale], { type: 'region' }).of(code.toUpperCase());
    return name ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

/**
 * Free-text aliases scrapers may store instead of ISO codes.
 */
export function countryNameAliases(code: string): string[] {
  const aliases: Record<string, string[]> = {
    DE: ['Germany', 'Deutschland', 'Alemanha'],
    GB: ['United Kingdom', 'UK', 'Great Britain', 'Reino Unido'],
    ES: ['Spain', 'España', 'Espanha'],
    BE: ['Belgium', 'België', 'Belgique', 'Bélgica'],
    FI: ['Finland', 'Suomi', 'Finlândia'],
    EE: ['Estonia', 'Eesti', 'Estônia'],
    PL: ['Poland', 'Polska', 'Polônia'],
    AT: ['Austria', 'Österreich', 'Áustria'],
    DK: ['Denmark', 'Danmark', 'Dinamarca'],
    FR: ['France', 'França'],
    CY: ['Cyprus', 'Κύπρος', 'Chipre'],
    CZ: ['Czech Republic', 'Czechia', 'Česko', 'República Tcheca'],
    IT: ['Italy', 'Italia', 'Itália'],
    IE: ['Ireland', 'Éire', 'Irlanda'],
    HU: ['Hungary', 'Magyarország', 'Hungria'],
    PT: ['Portugal'],
    CH: ['Switzerland', 'Schweiz', 'Suisse', 'Svizzera', 'Suíça'],
    SE: ['Sweden', 'Sverige', 'Suécia'],
    NO: ['Norway', 'Norge', 'Noruega'],
    NL: ['Netherlands', 'Holland', 'Nederland', 'Países Baixos'],
    LU: ['Luxembourg', 'Luxemburgo'],
    AU: ['Australia', 'Austrália'],
    NZ: ['New Zealand', 'Aotearoa', 'Nova Zelândia'],
    CA: ['Canada', 'Canadá'],
    US: ['United States', 'USA', 'United States of America', 'Estados Unidos'],
    BR: ['Brazil', 'Brasil'],
    JP: ['Japan', '日本', 'Japão'],
    AE: ['United Arab Emirates', 'UAE', 'Emirados Árabes Unidos'],
  };
  return aliases[code.toUpperCase()] ?? [];
}
