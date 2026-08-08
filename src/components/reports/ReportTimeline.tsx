import { Icon } from '../Icon';
import type { ActiveReport } from '../../data/mockData';
import { formatClock, formatElapsed, formatRelative } from '../../utils/time';

interface ReportTimelineProps {
  readonly report: ActiveReport;
}

function stageTone(isLast: boolean, isResolved: boolean): string {
  if (isResolved) return 'bg-success border-success';
  if (isLast) return 'bg-primary border-primary';
  return 'bg-surface-container-lowest border-primary/40';
}

function stageIcon(isLast: boolean, isResolved: boolean): string {
  if (isResolved) return 'check';
  if (isLast) return 'pending';
  return 'done';
}

export const ReportTimeline: React.FC<ReportTimelineProps> = ({ report }) => {
  const { status, estimate } = report;
  const events = report.events;
  const first = events[0];
  const last = events[events.length - 1];
  const now = Date.now();
  const isResolved = status === 'Resolved';
  const firstAt = new Date(first.at).getTime();
  const lastAt = new Date(last.at).getTime();

  const headline = isResolved
    ? `Resolved in ${formatElapsed(lastAt - firstAt)}`
    : `Reported ${formatRelative(first.at)}`;
  const subline = isResolved
    ? `Reported ${formatRelative(first.at)}`
    : last.id === 'in-progress'
      ? `In progress for ${formatElapsed(now - lastAt)}`
      : `Last update ${formatRelative(last.at)}`;

  return (
    <div className="mt-4 pt-4 border-t border-outline-variant/30">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="font-title-md text-title-md text-on-surface">{headline}</p>
          <p className="font-body-md text-sm text-on-surface-variant">{subline}</p>
        </div>
        <span className="font-label-sm text-label-sm text-primary whitespace-nowrap">{estimate}</span>
      </div>

      <div className="flex flex-col">
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          const tone = stageTone(isLast, isResolved);
          return (
            <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="flex flex-col items-center self-stretch">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] mt-0.5 ${tone} ${
                    isLast && !isResolved ? 'shadow-[0_0_0_4px_rgba(0,50,138,0.12)]' : ''
                  }`}
                >
                  <Icon name={stageIcon(isLast, isResolved)} filled className="text-[12px]" />
                </span>
                {!isLast ? <span className="w-0.5 flex-1 bg-outline-variant/60" /> : null}
              </div>
              <div className="pb-1 min-w-0">
                <p
                  className={`font-body-md text-body-md font-semibold ${
                    isLast && !isResolved ? 'text-primary' : 'text-on-surface'
                  }`}
                >
                  {event.label}
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {formatClock(event.at)} · {formatRelative(event.at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
