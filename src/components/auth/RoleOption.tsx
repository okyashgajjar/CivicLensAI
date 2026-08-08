import { Icon } from '../Icon';

interface RoleOptionProps {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
}

export const RoleOption: React.FC<RoleOptionProps> = ({ title, description, icon, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-primary bg-primary/5 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]'
          : 'border-outline-variant bg-surface hover:bg-surface-container-low'
      }`}
    >
      <div
        className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors ${
          selected ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
        }`}
      >
        <Icon name={icon} className="text-[22px]" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`block font-title-md text-title-md ${selected ? 'text-primary' : 'text-on-surface'}`}>
          {title}
        </span>
        <span className="block font-body-md text-sm text-on-surface-variant">{description}</span>
      </div>
      <span
        className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? 'border-primary' : 'border-outline-variant'
        }`}
      >
        {selected ? <span className="w-2.5 h-2.5 rounded-full bg-primary" /> : null}
      </span>
    </button>
  );
};
