import { PROCESSING_STATUS } from '../../data/mockData';

interface ProcessingStatusProps {
  readonly className?: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = () => {
  return (
    <div className="bg-surface-bright rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-gutter border border-surface-container-highest">
      <h3 className="font-title-md text-title-md text-on-surface mb-4">AI Processing Status</h3>
      <div className="flex flex-col gap-4">
        {PROCESSING_STATUS.map((status) => (
          <div key={status.label}>
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface mb-1">
              <span>{status.label}</span>
              <span className="text-primary">{status.value}</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${status.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
