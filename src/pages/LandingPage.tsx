import { useRef } from 'react';
import { useReveal } from '../hooks/useReveal';
import { LandingHeader } from '../components/landing/LandingHeader';
import { LandingHero } from '../components/landing/LandingHero';
import { WorkflowSection } from '../components/landing/WorkflowSection';
import { LandingFooter } from '../components/landing/LandingFooter';

interface LandingPageProps {
  readonly className?: string;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const mainRef = useRef<HTMLElement>(null);
  useReveal(mainRef);

  return (
    <div className="min-h-screen pt-16 md:pt-20 flex flex-col">
      <LandingHeader />
      <main
        ref={mainRef}
        className="flex-1 w-full max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop pb-24 md:pb-32"
      >
        <LandingHero />
        <WorkflowSection />
      </main>
      <LandingFooter />
    </div>
  );
};
