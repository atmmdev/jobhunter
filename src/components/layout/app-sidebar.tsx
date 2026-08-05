'use client';

import {
  Briefcase,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Radio,
  Send,
  Settings,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { Link, usePathname } from '@/shared/i18n/navigation';
import { cn } from '@/shared/lib/utils';

const items = [
  { href: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { href: '/jobs', key: 'jobs', icon: Briefcase },
  { href: '/applications', key: 'applications', icon: Send },
  { href: '/resumes', key: 'resumes', icon: FileText },
  { href: '/sources', key: 'sources', icon: Radio },
  { href: '/settings', key: 'settings', icon: Settings },
  { href: '/help', key: 'help', icon: CircleHelp },
] as const;

interface AppSidebarProps {
  notifications?: ReactNode;
}

/**
 * Desktop-first sidebar navigation for the authenticated shell.
 */
export function AppSidebar({ notifications }: AppSidebarProps) {
  const t = useTranslations('nav');
  const tApp = useTranslations('app');
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="px-5 py-6">
        <p className="text-lg font-semibold tracking-tight">{tApp('name')}</p>
        <p className="mt-1 text-xs text-muted-foreground">{tApp('tagline')}</p>
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
      {notifications}
      <div className="flex items-center justify-between gap-2 border-t border-border p-3">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </aside>
  );
}
