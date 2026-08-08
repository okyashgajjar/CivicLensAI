import { useState, type InputHTMLAttributes } from 'react';
import { Icon } from '../Icon';

interface TextFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly type?: 'text' | 'password' | 'email' | 'tel';
  readonly placeholder?: string;
  readonly icon?: string;
  readonly error?: string;
  readonly autoComplete?: string;
  readonly inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
}

export const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
  error,
  autoComplete,
  inputMode,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const borderTone = error ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-label-sm text-label-sm text-on-surface">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            <Icon name={icon} className="text-[20px]" />
          </span>
        ) : null}
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`w-full bg-surface border rounded-lg py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 transition-shadow placeholder:text-on-surface-variant/50 ${borderTone} ${
            icon ? 'pl-10' : 'pl-4'
          } ${isPassword ? 'pr-12' : 'pr-4'}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-[20px]" />
          </button>
        ) : null}
      </div>
      {error ? <p className="font-label-sm text-label-sm text-error mt-1">{error}</p> : null}
    </div>
  );
};
