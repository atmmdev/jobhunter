export const ATS_TYPES = [
  'GREENHOUSE',
  'LEVER',
  'ASHBY',
  'WORKDAY',
  'BAMBOOHR',
  'SMARTRECRUITERS',
  'TEAMTAILOR',
  'PERSONIO',
  'GUPY',
  'KENOBY',
  'SOLIDES',
  'LINKEDIN',
  'INDEED',
  'CATHO',
  'APINFO',
  'CUSTOM',
  'UNKNOWN',
] as const;

export type AtsTypeValue = (typeof ATS_TYPES)[number];
