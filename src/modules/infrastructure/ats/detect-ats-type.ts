import type { AtsTypeValue } from '@/modules/domain/ats/ats-type';

const ATS_PATTERNS: ReadonlyArray<{ atsType: AtsTypeValue; pattern: RegExp }> = [
  { atsType: 'GREENHOUSE', pattern: /boards\.greenhouse\.io|greenhouse\.io/i },
  { atsType: 'LEVER', pattern: /jobs\.lever\.co|lever\.co/i },
  { atsType: 'ASHBY', pattern: /jobs\.ashbyhq\.com|ashbyhq\.com/i },
  { atsType: 'WORKDAY', pattern: /myworkdayjobs\.com|workday\.com/i },
  { atsType: 'BAMBOOHR', pattern: /bamboohr\.com/i },
  { atsType: 'SMARTRECRUITERS', pattern: /smartrecruiters\.com/i },
  { atsType: 'TEAMTAILOR', pattern: /teamtailor\.com/i },
  { atsType: 'GUPY', pattern: /gupy\.io/i },
  { atsType: 'KENOBY', pattern: /kenoby\.com/i },
  { atsType: 'SOLIDES', pattern: /solides\.com(\.br)?/i },
  { atsType: 'LINKEDIN', pattern: /linkedin\.com\/jobs/i },
  { atsType: 'INDEED', pattern: /indeed\.com(\.br)?/i },
  { atsType: 'CATHO', pattern: /catho\.com\.br/i },
  { atsType: 'APINFO', pattern: /apinfo\.com/i },
];

/**
 * Detects ATS type from a careers or board URL.
 */
export function detectAtsType(url: string): AtsTypeValue {
  try {
    const normalized = url.includes('://') ? url : `https://${url}`;
    const parsed = new URL(normalized);

    for (const entry of ATS_PATTERNS) {
      if (entry.pattern.test(parsed.hostname) || entry.pattern.test(parsed.href)) {
        return entry.atsType;
      }
    }

    return 'CUSTOM';
  } catch {
    return 'UNKNOWN';
  }
}
