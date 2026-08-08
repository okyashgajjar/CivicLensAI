import { Icon } from '../Icon';
import { severityClasses } from '../../utils/severity';
import type { ApiDuplicateMatch } from '../../api/client';

interface DuplicateDetectionPanelProps {
  readonly ready: boolean;
  readonly progress: number;
  readonly complete: boolean;
  readonly matches: readonly ApiDuplicateMatch[];
  readonly error: string | null;
}

export const DuplicateDetectionPanel: React.FC<DuplicateDetectionPanelProps> = ({
  ready,
  progress,
  complete,
  matches,
  error,
}) => {
  const found = complete && matches.length > 0;
  const clear = complete && !error && !found;

  return (
    <section
      className={`relative overflow-hidden rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] border p-gutter ${
        found
          ? 'bg-secondary-fixed border-secondary-fixed-dim'
          : clear
            ? 'bg-surface-container-highest border-outline-variant/40'
            : 'bg-surface-container-highest border-primary/20'
      }`}
    >
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl ai-pulse-fx" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="bg-surface p-3 rounded-full shadow-sm flex-shrink-0">
          <Icon
            name={found ? 'file_copy' : clear ? 'verified' : 'radar'}
            className={`text-primary text-[32px] ${ready && !complete ? 'animate-spin' : ''}`}
          />
        </div>
        <div className="flex-1 w-full">
          <h3 className="font-title-md text-title-md text-primary mb-1 flex items-center gap-2">
            {!ready
              ? 'Add a photo to start scan'
              : found
                ? 'Duplicate issue found'
                : clear
                  ? 'No duplicates found'
                  : 'Detecting Duplicates...'}
            {!clear ? <Icon name="auto_awesome" className="text-[16px] text-secondary-container" /> : null}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-3">
            {!ready
              ? 'Upload a photo and CivicLens AI will check for an open issue at the exact same location.'
              : found
                ? `${matches.length === 1 ? 'An open issue' : `${matches.length} open issues`} ${
                    matches.length === 1 ? 'was' : 'were'
                  } found at this exact location.`
                : error
                  ? error
                  : 'CivicLens AI cross-referenced the location with open issues and found no duplicate.'}
          </p>

          {!ready ? (
            <span className="inline-flex items-center gap-1 bg-surface/70 text-on-surface-variant px-3 py-1.5 rounded-full font-label-sm text-label-sm">
              <Icon name="pending" className="text-[14px]" />
              Waiting for photo
            </span>
          ) : !complete ? (
            <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : found ? (
            <div className="flex flex-col gap-2">
              {matches.slice(0, 3).map((match) => (
                <div
                  key={`${match.source}-${match.id}`}
                  className="flex items-center gap-2 bg-surface/70 rounded-lg px-3 py-2 border border-secondary-fixed-dim"
                >
                  <Icon name="priority_high" className="text-secondary text-[18px] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-label-sm text-label-sm text-on-surface truncate">{match.title}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {match.category} · {match.status}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${severityClasses(match.severity)}`}
                  >
                    {match.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
