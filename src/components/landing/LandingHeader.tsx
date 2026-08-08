import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon';

interface LandingHeaderProps {
  readonly className?: string;
}

const NAV_LINKS: readonly { readonly label: string; readonly href: string }[] = [
  { label: 'Platform', href: '#workflow' },
  { label: 'Solutions', href: '#workflow' },
  { label: 'About', href: '#workflow' },
];

export const LandingHeader: React.FC<LandingHeaderProps> = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile py-4 md:px-margin-desktop bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300 ${
        scrolled ? 'shadow-md bg-surface/95' : ''
      }`}
    >
      <Link to="/" className="flex items-center gap-3 text-primary">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary shadow-sm">
          <Icon name="account_balance" filled className="text-xl" />
        </div>
        <span className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg font-bold tracking-tight">
          CivicLens AI
        </span>
      </Link>

      <nav className="hidden md:flex gap-8 font-label-sm text-label-sm font-semibold tracking-wide">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="hidden md:block">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-title-md text-title-md hover:bg-primary-container hover:shadow-lg transition-all duration-300"
        >
          Get Started
        </Link>
      </div>

      <button
        className="md:hidden text-on-surface"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        <Icon name={menuOpen ? 'close' : 'menu'} className="text-2xl" />
      </button>

      {menuOpen && (
        <div className="md:hidden fixed top-[73px] left-0 right-0 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 shadow-md p-6 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-label-sm text-label-sm font-semibold tracking-wide text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-title-md text-title-md text-center hover:bg-primary-container transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
};
