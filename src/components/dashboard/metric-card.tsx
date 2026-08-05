import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { METRIC_CARD_TONES, type MetricCardTone } from '@/shared/ui/metric-card-tones';

interface MetricCardProps {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone: MetricCardTone;
  className?: string;
}

/**
 * Dashboard metric tile (presentation only), tinted per metric tone.
 */
export function MetricCard({ title, value, hint, icon: Icon, tone, className }: MetricCardProps) {
  const styles = METRIC_CARD_TONES[tone];

  return (
    <Card className={cn(styles.container, className)}>
      <CardHeader className="flex-row items-start justify-between gap-2 p-4 pb-2">
        <CardTitle className="text-muted-foreground">{title}</CardTitle>
        <span className={cn('shrink-0 rounded-md p-1.5', styles.iconWrap)}>
          <Icon className={cn('h-4 w-4', styles.icon)} />
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
