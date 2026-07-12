'use client';

import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ACTION_ICON_TONES,
  type ActionIconTone,
} from '@/shared/ui/action-icon-tones';
import { cn } from '@/shared/lib/utils';

interface IconTooltipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: LucideIcon;
  tone?: ActionIconTone;
}

/**
 * Flat colored icon button with tooltip — shared action pattern for the whole app.
 * Requires a parent `TooltipProvider`.
 */
export function IconTooltipButton({
  label,
  icon: Icon,
  tone,
  className,
  type = 'button',
  ...props
}: IconTooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type={type}
          aria-label={label}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            'disabled:pointer-events-none disabled:opacity-40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            tone ? ACTION_ICON_TONES[tone] : 'text-muted-foreground hover:text-foreground',
            className,
          )}
          {...props}
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
