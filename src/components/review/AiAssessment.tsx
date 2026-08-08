import { Icon } from '../Icon';
import { AI_ASSESSMENT } from '../../data/mockData';

interface AiAssessmentProps {
  readonly className?: string;
}

export const AiAssessment: React.FC<AiAssessmentProps> = () => {
  const assessment = AI_ASSESSMENT;
  return (
    <div className="rounded-xl bg-surface p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-surface-container-highest flex flex-col gap-5">
      <div className="flex items-center gap-2 border-b border-surface-container-high pb-4">
        <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center">
          <Icon name="robot_2" className="text-primary text-[20px]" />
        </div>
        <h2 className="font-title-md text-title-md text-on-surface">AI Assessment</h2>
      </div>
      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Category</span>
          <span className="font-body-md text-body-md text-on-surface">{assessment.category}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Severity</span>
          <div className="inline-flex items-center gap-1.5 bg-error-container text-on-error-container px-2.5 py-1 rounded-lg w-fit">
            <Icon name="warning" filled className="text-[16px]" />
            <span className="font-label-sm text-label-sm">{assessment.severity}</span>
          </div>
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Department</span>
          <span className="font-body-md text-body-md text-on-surface">{assessment.department}</span>
        </div>
      </div>
      <div className="mt-2 bg-surface-container-low rounded-lg p-4 border border-outline-variant/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm pointer-events-none" />
        <div className="relative z-10">
          <p className="font-label-sm text-label-sm text-primary mb-2 flex items-center gap-1.5">
            <Icon name="psychology" className="text-[16px]" />
            AI Reasoning
          </p>
          <p className="font-body-md text-body-md text-on-surface">{assessment.reasoning}</p>
        </div>
      </div>
    </div>
  );
};
