import type { ReactNode } from 'react';

import { AppSidebar } from '@/components/layout/app-sidebar';

/**
 * Authenticated dashboard chrome with sidebar.
 */
export default function DashboardShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
