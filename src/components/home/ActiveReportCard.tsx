import { Link } from 'react-router-dom';
import { Icon } from '../Icon';
import { StatusChip } from '../StatusChip';
import { ReportTimeline } from '../reports/ReportTimeline';
import type { ActiveReport } from '../../data/mockData';

interface ActiveReportCardProps {
  readonly report: ActiveReport;
  readonly showTimeline?: boolean;
}

export const ActiveReportCard: React.FC<ActiveReportCardProps> = ({ report, showTimeline = false }) => {
  return (
    <article
      className={`snap-start shrink-0 bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 overflow-hidden flex flex-col hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] transition-shadow ${
        showTimeline ? 'w-full' : 'w-72 md:w-80'
      }`}
    >
      <div className="h-32 bg-surface-container-high relative flex items-center justify-center">
        {report.imageUrl ? (
          <img alt={report.title} loading="lazy" decoding="async" className="w-full h-full object-cover" src={report.imageUrl} />
        ) : (
          <Icon name="broken_image" className="text-4xl text-outline" />
        )}
        <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
          {report.urgent ? <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" /> : <span className="w-2 h-2 rounded-full bg-outline" />}
          <span className="font-label-sm text-label-sm text-on-surface">{report.status}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-grow">
        {report.aiVerified ? <StatusChip label="AI Verified" icon="temp_preferences_custom" tone="primary" /> : null}
        <h4 className="font-title-md text-title-md text-on-surface line-clamp-1">{report.title}</h4>
        <p className="font-body-md text-sm text-on-surface-variant flex items-center gap-1">
          <Icon name="location_on" className="text-[16px]" />
          {report.address}
        </p>
        <div className="mt-auto pt-3 border-t border-outline-variant/30 flex justify-between items-center text-xs text-on-surface-variant">
          <span>Reported: {report.reported}</span>
          <span className={`font-medium ${report.urgent ? 'text-primary' : 'text-on-surface-variant'}`}>
            {report.estimate}
          </span>
        </div>
        {showTimeline ? <ReportTimeline report={report} /> : null}
      </div>
    </article>
  );
};

interface NewReportCardProps {
  readonly className?: string;
}

export const NewReportCard: React.FC<NewReportCardProps> = () => {
  return (
    <Link
      to="/report"
      className="snap-start shrink-0 w-72 md:w-80 bg-surface border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-low transition-colors min-h-[250px]"
    >
      <Icon name="add_circle" className="text-primary text-4xl mb-2" />
      <span className="font-title-md text-title-md text-primary">New Report</span>
    </Link>
  );
};
