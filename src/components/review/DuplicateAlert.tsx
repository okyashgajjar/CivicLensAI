import { Icon } from '../Icon';
import { severityClasses } from '../../utils/severity';
import type { ReportDuplicate } from '../../types/report';

interface DuplicateAlertProps {
  readonly className?: string;
  readonly duplicates: readonly ReportDuplicate[];
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({ duplicates }) => {
  if (duplicates.length === 0) return null;
  const match = duplicates[0];

  return (
    <div className="rounded-xl bg-secondary-fixed p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-secondary-fixed-dim flex gap-4 items-start relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/30 blur-2xl rounded-full" />
      <div className="bg-secondary/10 w-10 h-10 flex items-center justify-center rounded-full text-on-secondary-fixed-variant flex-shrink-0">
        <Icon name="file_copy" />
      </div>
      <div className="flex-1 relative z-10">
        <h3 className="font-title-md text-title-md text-on-secondary-fixed-variant mb-1">Potential Duplicate</h3>
        <p className="font-body-md text-body-md text-on-secondary-fixed-variant/90 mb-3">
          An open issue was found at this exact location: <strong className="font-bold">{match.title}</strong>
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-lg font-label-sm text-label-sm bg-surface/70 text-on-surface-variant">
            {match.category} · {match.status}
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm ${severityClasses(match.severity)}`}>
            {match.severity}
          </span>
        </div>
        <button className="font-label-sm text-label-sm text-secondary flex items-center gap-1 active:opacity-70 transition-opacity">
          View original report
          <Icon name="chevron_right" className="text-[14px]" />
        </button>
      </div>
    </div>
  );
};
