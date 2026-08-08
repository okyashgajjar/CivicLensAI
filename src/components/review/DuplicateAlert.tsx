import { Icon } from '../Icon';
import { DUPLICATE_ALERT } from '../../data/mockData';

interface DuplicateAlertProps {
  readonly className?: string;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = () => {
  return (
    <div className="rounded-xl bg-secondary-fixed p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-secondary-fixed-dim flex gap-4 items-start relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/30 blur-2xl rounded-full" />
      <div className="bg-secondary/10 w-10 h-10 flex items-center justify-center rounded-full text-on-secondary-fixed-variant flex-shrink-0">
        <Icon name="file_copy" />
      </div>
      <div className="flex-1 relative z-10">
        <h3 className="font-title-md text-title-md text-on-secondary-fixed-variant mb-1">{DUPLICATE_ALERT.heading}</h3>
        <p className="font-body-md text-body-md text-on-secondary-fixed-variant/90 mb-3">
          {DUPLICATE_ALERT.body} <strong className="font-bold">{DUPLICATE_ALERT.distance}</strong> recently.
        </p>
        <button className="font-label-sm text-label-sm text-secondary flex items-center gap-1 active:opacity-70 transition-opacity">
          {DUPLICATE_ALERT.actionLabel}
          <Icon name="chevron_right" className="text-[14px]" />
        </button>
      </div>
    </div>
  );
};
