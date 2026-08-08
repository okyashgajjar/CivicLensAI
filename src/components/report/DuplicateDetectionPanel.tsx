import { Icon } from '../Icon';

interface DuplicateDetectionPanelProps {
  readonly ready: boolean;
  readonly progress: number;
  readonly complete: boolean;
}

export const DuplicateDetectionPanel: React.FC<DuplicateDetectionPanelProps> = ({ ready, progress, complete }) => {
  return (
    <section className="relative overflow-hidden bg-surface-container-highest rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] border border-primary/20 p-gutter">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl ai-pulse-fx" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="bg-surface p-3 rounded-full shadow-sm flex-shrink-0">
          <Icon
            name="radar"
            className={`text-primary text-[32px] ${ready && !complete ? 'animate-spin' : ''}`}
          />
        </div>
        <div className="flex-1 w-full">
          <h3 className="font-title-md text-title-md text-primary mb-1 flex items-center gap-2">
            {!ready
              ? 'Add details to start scan'
              : complete
                ? 'Duplicate check complete'
                : 'Detecting Duplicates...'}
            <Icon name="auto_awesome" className="text-[16px] text-secondary-container" />
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-3">
            {!ready
              ? 'Add a photo and description above. CivicLens AI will cross-reference your location and image with existing open reports.'
              : 'CivicLens AI is cross-referencing your location and image with existing open reports to prevent redundant dispatch.'}
          </p>
          {ready ? (
            <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 bg-surface/70 text-on-surface-variant px-3 py-1.5 rounded-full font-label-sm text-label-sm">
              <Icon name="pending" className="text-[14px]" />
              Waiting for photo &amp; description
            </span>
          )}
          <div className="flex justify-between mt-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {!ready ? 'Not started' : complete ? 'Analysis finished' : 'Analyzing metadata...'}
            </span>
            {ready ? (
              <span className="font-label-sm text-label-sm text-primary font-bold">{progress}%</span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
