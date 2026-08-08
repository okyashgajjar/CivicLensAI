import { useLocation, useNavigate } from 'react-router-dom';
import { AgenticFlowCard } from 'component-labs';
import { Icon } from '../components/Icon';
import { AGENT_STEP_ORDER, payloadOf, useAgentPipeline, type AgentStepKey } from '../hooks/useAgentPipeline';
import type { ApiAgentAnalysis } from '../api/client';
import type { ReportDraft } from '../types/report';

const FLOW_STEPS = [
  { label: 'CLASSIFY', desc: 'Detecting the issue class from the uploaded image.', dot: '#6B9E6B', color: '#6B9E6B' },
  { label: 'DUPLICATE', desc: 'Scanning open issues at this exact location.', dot: '#7B9EC4', color: '#7B9EC4' },
  { label: 'SEVERITY', desc: 'Checking traffic history and computing escalation.', dot: '#C4856C', color: '#C4856C' },
  { label: 'ROUTE', desc: 'Assigning the responsible municipal department.', dot: '#A0A0A0', color: '#A0A0A0' },
  { label: 'NOTIFY', desc: 'Dispatching the report to the nearest zone office.', dot: '#8A7BB5', color: '#8A7BB5' },
  { label: 'SUMMARIZE', desc: 'Writing the authority brief for final review.', dot: '#C4856C', color: '#C4856C' },
];

const STEP_META: Record<AgentStepKey, { title: string; icon: string }> = {
  classification: { title: 'Image Classification', icon: 'image_search' },
  duplication: { title: 'Duplicate Scan', icon: 'file_copy' },
  severity: { title: 'Severity & Escalation', icon: 'speed' },
  routing: { title: 'Department Routing', icon: 'account_tree' },
  notify: { title: 'Authority Dispatch', icon: 'campaign' },
  summary: { title: 'Authority Brief', icon: 'summarize' },
};

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

interface StepCardProps {
  readonly step: AgentStepKey;
  readonly present: boolean;
  readonly done: boolean;
  readonly children: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ step, present, done, children }) => {
  const meta = STEP_META[step];
  if (!present) {
    return (
      <div className="rounded-xl bg-surface p-5 border border-surface-container-highest shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
          <Icon name={meta.icon} className="text-on-surface-variant text-[18px]" />
        </div>
        <div className="flex-1">
          <p className="font-label-sm text-label-sm text-on-surface-variant">{meta.title}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant/70">Waiting for agent…</p>
        </div>
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-surface p-5 border border-surface-container-highest shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${done ? 'bg-success-container' : 'bg-primary-container/20'}`}
        >
          <Icon
            name={done ? 'check' : meta.icon}
            className={`text-[18px] ${done ? 'text-success' : 'text-primary'}`}
          />
        </div>
        <div className="flex-1">
          <p className="font-label-sm text-label-sm text-on-surface-variant">{meta.title}</p>
          <p className="font-title-md text-title-md text-on-surface">
            {done ? 'Completed' : 'Running…'}
          </p>
        </div>
        {!done ? <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : null}
      </div>
      {children}
    </div>
  );
};

const EmptyPill = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
    {label}
  </span>
);

interface AgentProcessingPageProps {
  readonly className?: string;
}

export const AgentProcessingPage: React.FC<AgentProcessingPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = (location.state as { draft?: ReportDraft } | null)?.draft;
  const { status, steps, analysis, error, retry } = useAgentPipeline(draft);

  const byStep = (key: AgentStepKey) => payloadOf(steps, key);
  const doneCount = AGENT_STEP_ORDER.filter((key) => byStep(key)).length;
  const progressPct = Math.round((doneCount / AGENT_STEP_ORDER.length) * 100);

  const classification = byStep('classification') as ApiAgentAnalysis['classification'] | undefined;
  const duplication = byStep('duplication') as ApiAgentAnalysis['duplication'] | undefined;
  const severity = byStep('severity') as ApiAgentAnalysis['severity'] | undefined;
  const routing = byStep('routing') as ApiAgentAnalysis['routing'] | undefined;
  const notify = byStep('notify') as ApiAgentAnalysis['notify'] | undefined;
  const summary = byStep('summary') as ApiAgentAnalysis['summary'] | undefined;

  const handleContinue = () => {
    if (!draft) return;
    navigate('/report/review', { state: { draft, analysis } });
  };

  if (!draft) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
          <Icon name="hub" className="text-3xl text-on-surface-variant" />
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Nothing to process</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          Start a new report first, and the agents will analyze it here.
        </p>
        <button
          onClick={() => navigate('/report')}
          className="px-6 py-3 rounded-lg bg-primary text-on-primary font-body-lg text-body-lg shadow-md hover:bg-primary/90 transition-colors"
        >
          Start a Report
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center px-margin-mobile md:px-margin-desktop py-4 bg-surface shadow-sm z-20 sticky top-0 border-b border-surface-container-highest">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container-high transition-colors text-on-surface"
          onClick={() => navigate('/report')}
          aria-label="Back"
        >
          <Icon name="arrow_back" />
        </button>
        <div className="flex-1 ml-2 min-w-0">
          <h1 className="font-title-md text-title-md text-on-surface truncate">Agents at Work</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
            {status === 'completed' ? 'Pipeline finished · ready to review' : `${doneCount} of ${AGENT_STEP_ORDER.length} agents done`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status !== 'completed' && status !== 'failed' ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/40 text-primary font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live
            </span>
          ) : status === 'failed' ? (
            <span className="px-3 py-1.5 rounded-full bg-error-container text-error font-label-sm text-label-sm">Failed</span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-success-container text-success font-label-sm text-label-sm">
              <Icon name="check_circle" className="text-[16px] mr-1 inline-block" />
              Complete
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-6 pb-40">
        <div className="max-w-[1080px] mx-auto grid lg:grid-cols-[380px_1fr] gap-6 items-start">
          <aside className="flex flex-col gap-4">
            <AgenticFlowCard
              title="Agentic Pipeline"
              steps={FLOW_STEPS}
              className="py-6! px-4! sm:px-6!"
            />
            <div className="rounded-xl bg-surface p-5 border border-surface-container-highest shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Real-time Progress</p>
                <p className="font-body-md text-body-md text-primary font-bold">{progressPct}%</p>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {AGENT_STEP_ORDER.map((key) => {
                  const present = Boolean(byStep(key));
                  const meta = STEP_META[key];
                  return (
                    <div key={key} className="flex items-center gap-2.5 py-1.5">
                      {present ? (
                        <Icon name="check_circle" className="text-success text-[18px] shrink-0" />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-outline-variant shrink-0" />
                      )}
                      <span className={`font-label-sm text-label-sm ${present ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {meta.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <StepCard step="classification" present={Boolean(classification)} done={Boolean(classification)}>
              {classification ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-primary-container/30 text-primary font-label-sm text-label-sm">
                    {classification.label}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    {(classification.confidence ?? 0).toFixed(2)} confidence
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm ${priorityClasses(classification.severity)}`}
                  >
                    {classification.severity}
                  </span>
                  {!classification.is_issue ? (
                    <span className="px-3 py-1.5 rounded-lg bg-warning-container text-on-warning-container font-label-sm text-label-sm">
                      No civic issue detected
                    </span>
                  ) : null}
                </div>
              ) : null}
            </StepCard>

            <StepCard step="duplication" present={Boolean(duplication)} done={Boolean(duplication)}>
              {duplication ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {duplication.is_duplicate ? (
                      <span className="px-3 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm">
                        Duplicate found
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-success-container text-success font-label-sm text-label-sm">
                        No exact duplicate
                      </span>
                    )}
                    <EmptyPill label={`${duplication.matches.length} open issue(s) nearby`} />
                  </div>
                  {duplication.matches[0] ? (
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {duplication.matches[0].title}
                      {duplication.matches[0].distance_m !== null && duplication.matches[0].distance_m !== undefined
                        ? ` · ${Math.round(duplication.matches[0].distance_m)}m away`
                        : ''}
                    </p>
                  ) : null}
                  <p className="font-body-sm text-body-sm text-on-surface-variant/80">{duplication.reasoning}</p>
                </div>
              ) : null}
            </StepCard>

            <StepCard step="severity" present={Boolean(severity)} done={Boolean(severity)}>
              {severity ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm ${priorityClasses(severity.severity)}`}>
                      {severity.severity}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                      base {severity.base_severity}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-error-container text-error font-label-sm text-label-sm">
                      +{severity.escalation_pct}% escalated
                    </span>
                    <EmptyPill label={`${severity.duplicate_count} duplicate(s)`} />
                    <EmptyPill label={`${severity.history_count} in history`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full rounded-full bg-error transition-all duration-500"
                        style={{ width: `${severity.escalation_pct}%` }}
                      />
                    </div>
                    <span className="font-label-sm text-label-sm text-error">{severity.escalation_pct}%</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant/80">{severity.reasoning}</p>
                </div>
              ) : null}
            </StepCard>

            <StepCard step="routing" present={Boolean(routing)} done={Boolean(routing)}>
              {routing ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="font-body-md text-body-md text-on-surface font-semibold">{routing.department}</p>
                    <span className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm ${priorityClasses(routing.priority)}`}>
                      {routing.priority}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{routing.subdepartment ?? 'General intake'}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant/80">{routing.reasoning}</p>
                </div>
              ) : null}
            </StepCard>

            <StepCard step="notify" present={Boolean(notify)} done={Boolean(notify)}>
              {notify ? (
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg bg-success-container/40 p-3 border border-success-container flex flex-col gap-1">
                    <p className="font-label-sm text-label-sm text-success uppercase tracking-wider">
                      {notify.status} · {notify.authority}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface font-semibold">
                      {notify.office}
                      <span className="font-body-sm text-body-sm text-on-surface-variant"> · {notify.zone} zone</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {notify.medium.map((medium) => (
                        <span key={medium} className="px-2.5 py-1 rounded-lg bg-surface text-success font-label-sm text-label-sm">
                          {medium}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {notify.nearby.slice(0, 3).map((office) => (
                      <div key={office.office} className="flex items-center justify-between gap-3">
                        <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{office.office}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
                          {office.distance_km !== null && office.distance_km !== undefined
                            ? `${office.distance_km.toFixed(1)} km`
                            : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </StepCard>

            <StepCard step="summary" present={Boolean(summary)} done={Boolean(summary)}>
              {summary ? (
                <div className="flex flex-col gap-2">
                  <p className="font-body-md text-body-md text-on-surface">{summary.summary}</p>
                  {summary.key_points.length > 0 ? (
                    <ul className="flex flex-col gap-1">
                      {summary.key_points.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 font-label-sm text-label-sm text-on-surface-variant">
                          <Icon name="check_circle" className="text-primary text-[14px] mt-0.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex items-start gap-2 rounded-lg bg-surface-container-low p-3 border border-outline-variant/40">
                    <Icon name="flag" className="text-primary text-[16px] mt-0.5 shrink-0" />
                    <p className="font-label-sm text-label-sm text-on-surface">
                      <span className="font-bold">Recommended: </span>
                      {summary.recommended_action}
                    </p>
                  </div>
                </div>
              ) : null}
            </StepCard>

            {error ? (
              <div className="flex items-center gap-2 bg-error-container rounded-lg px-4 py-3">
                <Icon name="error" className="text-error text-[18px] shrink-0" />
                <p className="font-label-sm text-label-sm text-error flex-1">{error}</p>
                <button
                  onClick={retry}
                  className="px-3 py-1.5 rounded-lg bg-error text-on-error font-label-sm text-label-sm"
                >
                  Retry
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 px-margin-mobile md:px-margin-desktop py-4 shadow-[0px_-4px_16px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={() => navigate('/report')}
            className="order-2 sm:order-1 px-6 py-3 rounded-lg border border-primary text-primary font-body-lg text-body-lg text-center hover:bg-primary/5 transition-colors"
          >
            Back to Report
          </button>
          <button
            onClick={handleContinue}
            disabled={status !== 'completed'}
            className="order-1 sm:order-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-body-lg text-body-lg text-center shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'completed' ? (
              <>
                Continue to Review
                <Icon name="arrow_forward" className="text-[20px]" />
              </>
            ) : status === 'failed' ? (
              'Pipeline Failed'
            ) : (
              <>
                Agents Working…
                <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
