import type { ReactNode } from 'react';

import '@/app/globals.css';

/**
 * Root layout required by Next.js. Locale-specific chrome lives under [locale].
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
