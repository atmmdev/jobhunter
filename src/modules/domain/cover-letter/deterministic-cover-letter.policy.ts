import type { AppLocale } from '@/modules/domain/user/user.entity';

/**
 * Builds a locale-aware cover letter template without AI.
 */
export function buildDeterministicCoverLetter(input: {
  locale: AppLocale;
  candidateName: string;
  jobTitle: string;
  companyName: string | null;
  resumeSummary: string | null;
  resumeExcerpt: string;
}): string {
  const company = input.companyName ?? (input.locale === 'pt-BR' ? 'sua empresa' : 'your company');
  const summary =
    input.resumeSummary?.trim() ||
    input.resumeExcerpt.slice(0, 400).trim() ||
    (input.locale === 'pt-BR' ? 'Minha experiência combina com os requisitos da vaga.' : 'My experience aligns with this role.');

  if (input.locale === 'pt-BR') {
    return [
      'Prezados(as),',
      '',
      `Tenho interesse na vaga de ${input.jobTitle} na ${company}.`,
      '',
      summary,
      '',
      'Fico à disposição para conversarmos sobre como posso contribuir com o time.',
      '',
      'Atenciosamente,',
      input.candidateName,
    ].join('\n');
  }

  return [
    'Dear Hiring Team,',
    '',
    `I am writing to express my interest in the ${input.jobTitle} role at ${company}.`,
    '',
    summary,
    '',
    'I would welcome the opportunity to discuss how my background can support your team.',
    '',
    'Best regards,',
    input.candidateName,
  ].join('\n');
}
