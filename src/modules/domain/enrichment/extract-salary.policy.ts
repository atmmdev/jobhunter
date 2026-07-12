export interface ExtractedSalary {
  min: number | null;
  max: number | null;
  currency: string | null;
  raw: string | null;
}

/**
 * Extracts salary range hints from free-form job text.
 */
export function extractSalary(input: {
  title: string;
  descriptionText: string;
  salaryRaw?: string | null;
}): ExtractedSalary {
  if (input.salaryRaw?.trim()) {
    const fromRaw = parseSalarySnippet(input.salaryRaw);
    if (fromRaw.min !== null || fromRaw.max !== null) {
      return { ...fromRaw, raw: input.salaryRaw.trim() };
    }
  }

  const haystack = `${input.title}\n${input.descriptionText}`;
  const patterns = [
    /(?:USD|US\$|\$)\s?([\d,.]+)\s*(?:k)?\s*(?:-|–|to)\s*(?:USD|US\$|\$)?\s?([\d,.]+)\s*(k)?/i,
    /(?:EUR|€)\s?([\d,.]+)\s*(?:k)?\s*(?:-|–|to)\s*(?:EUR|€)?\s?([\d,.]+)\s*(k)?/i,
    /(?:BRL|R\$)\s?([\d,.]+)\s*(?:-|–|to)\s*(?:BRL|R\$)?\s?([\d,.]+)/i,
    /([\d,.]+)\s*(?:k)?\s*(?:-|–|to)\s*([\d,.]+)\s*(k)?\s*(?:USD|EUR|GBP|BRL|\$|€)/i,
  ];

  for (const pattern of patterns) {
    const match = haystack.match(pattern);
    if (!match) {
      continue;
    }

    const currency = detectCurrency(match[0]);
    const thousand = Boolean(match[3] || /k/i.test(match[0]));
    const min = toAmount(match[1], thousand);
    const max = toAmount(match[2], thousand);

    if (min !== null || max !== null) {
      return {
        min,
        max,
        currency,
        raw: match[0].trim(),
      };
    }
  }

  return { min: null, max: null, currency: null, raw: null };
}

function detectCurrency(snippet: string): string | null {
  if (/R\$|BRL/i.test(snippet)) {
    return 'BRL';
  }
  if (/€|EUR/i.test(snippet)) {
    return 'EUR';
  }
  if (/£|GBP/i.test(snippet)) {
    return 'GBP';
  }
  if (/\$|USD/i.test(snippet)) {
    return 'USD';
  }
  return null;
}

function parseSalarySnippet(raw: string): ExtractedSalary {
  const match = raw.match(/([\d,.]+)\s*(?:k)?\s*(?:-|–|to)\s*([\d,.]+)\s*(k)?/i);
  if (!match) {
    return { min: null, max: null, currency: detectCurrency(raw), raw };
  }
  const thousand = Boolean(match[3] || /k/i.test(raw));
  return {
    min: toAmount(match[1], thousand),
    max: toAmount(match[2], thousand),
    currency: detectCurrency(raw),
    raw,
  };
}

function toAmount(value: string | undefined, thousand: boolean): number | null {
  if (!value) {
    return null;
  }
  const normalized = Number(value.replace(/,/g, '').replace(/\.(?=\d{3}\b)/g, ''));
  if (Number.isNaN(normalized)) {
    return null;
  }
  return thousand ? normalized * 1000 : normalized;
}
