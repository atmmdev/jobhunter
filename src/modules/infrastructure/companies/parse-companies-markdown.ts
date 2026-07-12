import { readFile, readdir } from 'fs/promises';
import path from 'path';

export interface ParsedCompanyRow {
  name: string;
  link: string;
  countryCode: string | null;
  fileName: string;
}

const COUNTRY_BY_FILE: Record<string, string | null> = {
  'australia.md': 'AU',
  'brazil.md': 'BR',
  'canada.md': 'CA',
  'england.md': 'GB',
  'estonia.md': 'EE',
  'germany.md': 'DE',
  'ireland.md': 'IE',
  'japan.md': 'JP',
  'netherlands.md': 'NL',
  'switzerland.md': 'CH',
  'uk.md': 'GB',
  'usa.md': 'US',
  'worldwide.md': null,
};

/**
 * Parses markdown tables with Name | Link columns into company rows.
 */
export function parseCompaniesMarkdown(
  content: string,
  fileName: string,
): ParsedCompanyRow[] {
  const countryCode = COUNTRY_BY_FILE[fileName] ?? null;

  const rows: ParsedCompanyRow[] = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      continue;
    }
    if (/^\|\s*-+/.test(trimmed) || /name\s*\|/i.test(trimmed)) {
      continue;
    }

    const cells = trimmed
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

    if (cells.length < 2) {
      continue;
    }

    const name = cells[0];
    const link = cells[1];
    if (!name || !link || !/^https?:\/\//i.test(link)) {
      continue;
    }

    rows.push({
      name,
      link,
      countryCode,
      fileName,
    });
  }

  return rows;
}

/**
 * Loads and parses all company markdown files from docs/companies-to-work.
 */
export async function loadCompaniesFromDocs(
  rootDir = process.cwd(),
): Promise<ParsedCompanyRow[]> {
  const dir = path.join(rootDir, 'docs', 'companies-to-work');
  const files = await readdir(dir);
  const markdownFiles = files.filter(
    (file) => file.endsWith('.md') && file.toLowerCase() !== 'readme.md',
  );

  const allRows: ParsedCompanyRow[] = [];

  for (const fileName of markdownFiles) {
    const content = await readFile(path.join(dir, fileName), 'utf8');
    allRows.push(...parseCompaniesMarkdown(content, fileName));
  }

  return allRows;
}
