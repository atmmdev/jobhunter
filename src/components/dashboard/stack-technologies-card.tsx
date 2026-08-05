import { Cpu } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { METRIC_CARD_TONES } from '@/shared/ui/metric-card-tones';

interface StackTechnologiesCardProps {
  title: string;
  technologies: string[];
  emptyLabel: string;
  className?: string;
}

/**
 * Dashboard card listing the resume's main stack technologies as pill chips.
 */
export function StackTechnologiesCard({
  title,
  technologies,
  emptyLabel,
  className,
}: StackTechnologiesCardProps) {
  const styles = METRIC_CARD_TONES.topTechnologies;

  return (
    <Card className={cn(styles.container, className)}>
      <CardHeader className="flex-row items-start justify-between gap-2 p-4 pb-2">
        <CardTitle className="text-muted-foreground">{title}</CardTitle>
        <span className={cn('shrink-0 rounded-md p-1.5', styles.iconWrap)}>
          <Cpu className={cn('h-4 w-4', styles.icon)} />
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {technologies.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {technologies.map((technology) => (
              <li key={technology}>
                <span className="inline-flex h-8 items-center rounded-full border border-fuchsia-500/50 bg-fuchsia-500/10 px-3 text-sm font-medium text-foreground">
                  {technology}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
