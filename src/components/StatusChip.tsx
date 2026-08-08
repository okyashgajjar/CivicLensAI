import { Icon } from './Icon';

interface StatusChipProps {
  readonly label: string;
  readonly icon?: string;
  readonly tone: 'primary' | 'success' | 'outline';
}

const toneStyles: Record<StatusChipProps['tone'], string> = {
  primary: 'bg-surface-container-low text-primary border border-primary-fixed',
  success: 'bg-success-container text-success',
  outline: 'bg-surface text-on-surface',
};

export const StatusChip: React.FC<StatusChipProps> = ({ label, icon, tone }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-label-sm ${toneStyles[tone]}`}
    >
      {icon ? <Icon name={icon} className="text-[14px]" filled /> : null}
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </span>
  );
};
