import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaaSFooter } from 'component-labs';

interface LandingFooterProps {
  readonly className?: string;
}

const ROUTES: Record<string, string> = {
  Features: '/features',
  Solution: '/platform',
  'Mobile App': '/mobile-app',
  About: '/about',
  Privacy: '/privacy',
  'Contact Sales': '/contact',
};

export const LandingFooter: React.FC<LandingFooterProps> = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const interactive = target.closest('a, button');
      if (!interactive) return;
      const label = (interactive.textContent ?? '').trim();
      const path = ROUTES[label];
      if (!path) return;
      event.preventDefault();
      navigate(path);
    };

    container.addEventListener('click', onClick);
    return () => container.removeEventListener('click', onClick);
  }, [navigate]);

  return (
    <div ref={containerRef}>
      <SaaSFooter
        ctaTitle="Build a more responsive city"
        ctaDescription="Join forward-thinking municipalities using CivicLens AI to classify, route, and resolve citizen reports faster."
        ctaButtonText="Contact Sales"
        brandName="CivicLens AI"
        brandDescription="CivicLens AI helps municipalities turn citizen reports into rapid, intelligent action."
        productLinks={['Features', 'Solution', 'Mobile App']}
        companyLinks={['About', 'Privacy']}
        copyright="© 2026 CivicLens AI, All rights reserved"
        statusText="All Systems Normal"
      />
    </div>
  );
};
