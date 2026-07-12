'use client';

import type { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface IconTooltipButtonProps extends ComponentProps<typeof Button> {
  label: string;
  icon: LucideIcon;
}

/**
 * Icon-only button with an accessible label and hover tooltip.
 * Requires a parent `TooltipProvider`.
 */
export function IconTooltipButton({
  label,
  icon: Icon,
  size = 'icon',
  variant = 'ghost',
  className,
  ...props
}: IconTooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size={size}
          variant={variant}
          className={className ?? 'h-8 w-8'}
          aria-label={label}
          {...props}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
