import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';

interface PageShellProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({ children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-16 md:pt-20 flex flex-col">
      <LandingHeader />
      <main className="flex-1 w-full max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop pb-24 md:pb-32">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
};
