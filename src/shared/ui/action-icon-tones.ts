/**
 * Shared color tones for flat icon action buttons across the app.
 */
export const ACTION_ICON_TONES = {
  score: 'text-blue-500 hover:text-blue-400',
  approve: 'text-emerald-500 hover:text-emerald-400',
  favorite: 'text-violet-500 hover:text-violet-400',
  reject: 'text-amber-400 hover:text-amber-300',
  delete: 'text-red-500 hover:text-red-400',
  restore: 'text-sky-400 hover:text-sky-300',
  run: 'text-emerald-500 hover:text-emerald-400',
  enable: 'text-emerald-500 hover:text-emerald-400',
  disable: 'text-amber-400 hover:text-amber-300',
  edit: 'text-sky-400 hover:text-sky-300',
  coverLetter: 'text-indigo-400 hover:text-indigo-300',
  generate: 'text-blue-500 hover:text-blue-400',
  save: 'text-emerald-500 hover:text-emerald-400',
  close: 'text-muted-foreground hover:text-foreground',
  markRead: 'text-sky-400 hover:text-sky-300',
  view: 'text-blue-500 hover:text-blue-400',
  pendingApply: 'text-blue-500 hover:text-blue-400',
  applied: 'text-emerald-500 hover:text-emerald-400',
  interview: 'text-violet-500 hover:text-violet-400',
  offer: 'text-emerald-500 hover:text-emerald-400',
  withdrawn: 'text-red-500 hover:text-red-400',
  manual: 'text-amber-400 hover:text-amber-300',
} as const;

export type ActionIconTone = keyof typeof ACTION_ICON_TONES;
