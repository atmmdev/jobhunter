import type { ReactNode } from 'react';

import { DashboardChrome } from '@/components/layout/dashboard-chrome';

/**
 * Authenticated dashboard layout shell.
 */
export default function DashboardShellLayout({ children }: { children: ReactNode }) {
  return <DashboardChrome>{children}</DashboardChrome>;
}
