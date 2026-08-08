import { Icon } from '../Icon';
import type { ApiAgentAnalysis } from '../../api/client';

interface AgentAnalysisProps {
  readonly className?: string;
  readonly loading: boolean;
  readonly analysis: ApiAgentAnalysis | null;
  readonly error: string | null;
}

function priorityClasses(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'CRITICAL':
    case 'HIGH':
      return 'bg-error-container text-on-error-container';
    case 'MEDIUM':
      return 'bg-secondary-fixed text-on-secondary-fixed-variant';
    case 'LOW':
      return 'bg-success-container text-success';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
}

export const AgentAnalysis: React.FC<AgentAnalysisProps> = ({ loading, analysis, error }) => {
  if (loading) {
    return (
      <section className="rounded-xl bg-surface p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-surface-container-highest">
        <div className="flex items-center gap-3">
          <Icon name="hub" className="text-primary text-[24px] animate-pulse" />
          <div className="flex-1">
            <p className="font-title-md text-title-md text-on-surface">Agents analyzing...</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Classification → Duplication → Routing → Summary
            </p>
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl bg-surface p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-surface-container-highest flex items-start gap-3">
        <Icon name="error" className="text-error text-[20px] shrink-0" />
        <div>
          <p className="font-title-md text-title-md text-on-surface mb-1">Agent analysis unavailable</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{error}</p>
        </div>
      </section>
    );
  }

  if (!analysis) return null;

  const { routing, summary, duplication } = analysis;

  return (
    <section className="rounded-xl bg-surface p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-surface-container-highest flex flex-col gap-5">
      <div className="flex items-center gap-2 border-b border-surface-container-high pb-4">
        <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center">
          <Icon name="hub" className="text-primary text-[20px]" />
        </div>
        <div className="flex-1">
          <h2 className="font-title-md text-title-md text-on-surface">Agent Analysis</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant">LangGraph pipeline · Session {analysis.session_id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-4 border border-outline-variant/40">
          <div className="flex items-center gap-3 min-w-0">
            <Icon name="account_tree" className="text-primary text-[22px] shrink-0" />
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Routed Department</p>
              <p className="font-body-md text-body-md text-on-surface truncate">{routing.department}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                {routing.subdepartment ?? 'General intake'}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm shrink-0 ${priorityClasses(routing.priority)}`}
          >
            {routing.priority}
          </span>
        </div>

        {duplication.is_duplicate ? (
          <div className="flex items-center gap-3 rounded-lg bg-secondary-fixed p-4 border border-secondary-fixed-dim">
            <Icon name="file_copy" className="text-secondary text-[22px] shrink-0" />
            <div>
              <p className="font-label-sm text-label-sm text-on-secondary-fixed-variant">Duplicate flagged by agent</p>
              <p className="font-label-sm text-label-sm text-on-secondary-fixed-variant/80">
                {duplication.matches[0]?.title ?? 'Matches an existing open issue'}
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg bg-surface-container-low p-4 border border-outline-variant/40 flex flex-col gap-3">
          <p className="font-label-sm text-label-sm text-primary flex items-center gap-1.5">
            <Icon name="summarize" className="text-[16px]" />
            Authority Summary
          </p>
          <p className="font-body-md text-body-md text-on-surface">{summary.summary}</p>
          {summary.key_points.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {summary.key_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 font-label-sm text-label-sm text-on-surface-variant">
                  <Icon name="check_circle" className="text-primary text-[14px] mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex items-start gap-2 rounded-lg bg-surface p-3 border border-outline-variant/40">
            <Icon name="flag" className="text-primary text-[16px] mt-0.5 shrink-0" />
            <p className="font-label-sm text-label-sm text-on-surface">
              <span className="font-bold">Recommended: </span>
              {summary.recommended_action}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
