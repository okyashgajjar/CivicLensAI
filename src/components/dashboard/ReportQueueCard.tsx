import { Icon } from '../Icon';
import type { QueueItem } from '../../data/mockData';

interface ReportQueueCardProps {
  readonly item: QueueItem;
  readonly onAdvance: (id: string) => void;
  readonly onAssign: (item: QueueItem) => void;
}

const severityStyles: Record<QueueItem['severity'], string> = {
  CRITICAL: 'bg-error text-on-error',
  MEDIUM: 'bg-secondary-container text-on-secondary-container',
  LOW: 'bg-surface-container-high text-on-surface',
};

const statusTone: Record<QueueItem['status'], string> = {
  Pending: 'bg-surface-container-high text-on-surface',
  Assigned: 'bg-primary/10 text-primary',
  Resolved: 'bg-success-container text-success',
};

export const ReportQueueCard: React.FC<ReportQueueCardProps> = ({ item, onAdvance, onAssign }) => {
  const actionLabel = item.status === 'Pending' ? 'Assign' : item.status === 'Assigned' ? 'Mark Resolved' : 'Reopen';
  const isResolved = item.status === 'Resolved';

  return (
    <article className="bg-surface-bright rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-gutter border border-surface-container-highest transition-shadow hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-32 h-32 md:h-auto rounded-lg overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center">
        {item.imageUrl ? (
          <img alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover" src={item.imageUrl} />
        ) : (
          <Icon name="map" className="text-4xl text-primary/40" />
        )}
      </div>
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 bg-surface-variant text-primary px-2 py-1 rounded font-label-sm text-label-sm">
                <Icon name="auto_awesome" className="text-[14px]" />
                AI Verified
              </span>
              {item.source === 'report' ? (
                <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2 py-1 rounded font-label-sm text-label-sm">
                  <Icon name="person" className="text-[14px]" />
                  Citizen Report
                </span>
              ) : null}
            </div>
            <h3 className="font-title-md text-title-md text-on-surface mt-1">{item.type}</h3>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`px-2 py-1 rounded font-label-sm text-label-sm ${severityStyles[item.severity]}`}>
              {item.severity}
            </span>
            <span className={`px-2 py-1 rounded font-label-sm text-label-sm ${statusTone[item.status]}`}>
              {item.status}
            </span>
          </div>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
          <Icon name="location_on" className="text-[16px]" />
          {item.address}
        </p>
        {item.assignedTo ? (
          <p className="font-label-sm text-label-sm text-primary flex items-center gap-1">
            <Icon name="engineering" className="text-[16px]" />
            Assigned to {item.assignedTo} · {item.assignedCrew}
          </p>
        ) : null}
        <div className="bg-surface-container p-3 rounded-lg mt-2">
          <p className="font-label-sm text-label-sm text-primary uppercase mb-1 flex items-center gap-1">
            <Icon name="smart_toy" className="text-[14px]" />
            AI Summary
          </p>
          <p className="font-body-md text-body-md text-on-surface">{item.aiSummary}</p>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button className="px-4 py-2 rounded-full border border-primary text-primary font-label-sm text-label-sm hover:bg-surface-container-low">
            View Details
          </button>
          <button
            onClick={() => (item.status === 'Pending' ? onAssign(item) : onAdvance(item.id))}
            className={`px-4 py-2 rounded-full font-label-sm text-label-sm hover:opacity-90 ${
              isResolved
                ? 'border border-primary text-primary hover:bg-surface-container-low'
                : 'bg-primary text-on-primary'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
};
