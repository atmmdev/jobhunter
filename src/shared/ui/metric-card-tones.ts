/**
 * Per-metric color tones for dashboard metric cards.
 * `container` tints border + background (20% opacity); `iconWrap` holds the icon.
 */
export const METRIC_CARD_TONES = {
  jobsFound: {
    container: 'border-blue-500/50 bg-blue-500/20',
    iconWrap: 'bg-blue-500/20',
    icon: 'text-blue-400',
  },
  applications: {
    container: 'border-sky-500/50 bg-sky-500/20',
    iconWrap: 'bg-sky-500/20',
    icon: 'text-sky-400',
  },
  favorites: {
    container: 'border-violet-500/50 bg-violet-500/20',
    iconWrap: 'bg-violet-500/20',
    icon: 'text-violet-400',
  },
  rejected: {
    container: 'border-rose-500/50 bg-rose-500/20',
    iconWrap: 'bg-rose-500/20',
    icon: 'text-rose-400',
  },
  interviews: {
    container: 'border-amber-500/50 bg-amber-500/20',
    iconWrap: 'bg-amber-500/20',
    icon: 'text-amber-400',
  },
  offers: {
    container: 'border-emerald-500/50 bg-emerald-500/20',
    iconWrap: 'bg-emerald-500/20',
    icon: 'text-emerald-400',
  },
  responseRate: {
    container: 'border-cyan-500/50 bg-cyan-500/20',
    iconWrap: 'bg-cyan-500/20',
    icon: 'text-cyan-400',
  },
  topTechnologies: {
    container: 'border-fuchsia-500/50 bg-fuchsia-500/20',
    iconWrap: 'bg-fuchsia-500/20',
    icon: 'text-fuchsia-400',
  },
} as const;

export type MetricCardTone = keyof typeof METRIC_CARD_TONES;
