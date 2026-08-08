import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { COUNTRY_CODES } from '../../data/countryCodes';

interface CountryCodeSelectProps {
  readonly value: string;
  readonly onChange: (code: string) => void;
  readonly error?: boolean;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ value, onChange, error }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-36 shrink-0">
      <div className="relative">
        <input
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="+1"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Country code"
          className={`w-full bg-surface border rounded-lg py-3 pl-3 pr-9 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50 ${
            error ? 'border-error' : 'border-outline-variant'
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Select country code"
          className="absolute right-0 top-0 bottom-0 px-2 flex items-center text-on-surface-variant hover:text-primary transition-colors"
        >
          <Icon name={open ? 'expand_less' : 'expand_more'} className="text-[18px]" />
        </button>
      </div>
      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 top-full mt-1 w-full bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg max-h-52 overflow-y-auto z-50"
        >
          {COUNTRY_CODES.map((entry) => (
            <li key={`${entry.code}-${entry.name}`} role="option" aria-selected={entry.code === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(entry.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-surface-container-low transition-colors ${
                  entry.code === value ? 'text-primary font-bold' : 'text-on-surface'
                }`}
              >
                <span className="truncate">{entry.name}</span>
                <span className="text-on-surface-variant text-sm shrink-0">{entry.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
