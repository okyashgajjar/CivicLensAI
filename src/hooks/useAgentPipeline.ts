import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, type ApiAgentAnalysis, type ApiAgentSession, type ApiAgentStep } from '../api/client';
import type { ReportDraft } from '../types/report';

export const AGENT_STEP_ORDER = [
  'classification',
  'duplication',
  'severity',
  'routing',
  'notify',
  'summary',
] as const;

export type AgentStepKey = (typeof AGENT_STEP_ORDER)[number];

export interface AgentPipelineState {
  readonly status: 'idle' | 'starting' | 'running' | 'completed' | 'failed';
  readonly sessionId: string | null;
  readonly steps: readonly ApiAgentStep[];
  readonly analysis: ApiAgentAnalysis | null;
  readonly error: string | null;
}

const POLL_INTERVAL_MS = 2500;

function payloadOf(steps: readonly ApiAgentStep[], step: AgentStepKey): Record<string, unknown> | undefined {
  return steps.find((item) => item.step === step)?.payload;
}

export function buildAgentAnalysis(session: ApiAgentSession, imageUrl: string | null): ApiAgentAnalysis | null {
  const byStep = new Map(session.steps.map((item) => [item.step, item.payload]));
  if (!AGENT_STEP_ORDER.every((step) => byStep.has(step))) return null;
  return {
    session_id: session.session_id,
    image_url: imageUrl,
    classification: byStep.get('classification') as unknown as ApiAgentAnalysis['classification'],
    duplication: byStep.get('duplication') as unknown as ApiAgentAnalysis['duplication'],
    severity: byStep.get('severity') as unknown as ApiAgentAnalysis['severity'],
    routing: byStep.get('routing') as unknown as ApiAgentAnalysis['routing'],
    notify: byStep.get('notify') as unknown as ApiAgentAnalysis['notify'],
    summary: byStep.get('summary') as unknown as ApiAgentAnalysis['summary'],
    errors: [],
  };
}

export function useAgentPipeline(draft: ReportDraft | null | undefined): AgentPipelineState & { readonly retry: () => void } {
  const [state, setState] = useState<AgentPipelineState>({
    status: 'idle',
    sessionId: null,
    steps: [],
    analysis: null,
    error: null,
  });
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(() => {
    if (!draft) return;
    clearTimer();
    setState({ status: 'starting', sessionId: null, steps: [], analysis: null, error: null });

    api
      .analyzeReport({
        lat: draft.lat ?? 23.0225,
        lng: draft.lng ?? 72.5714,
        category: draft.category,
        location: draft.address,
        description: draft.description,
        imageUrl: draft.imageUrl,
      })
      .then((accepted) => {
        setState((prev) => ({ ...prev, status: 'running', sessionId: accepted.session_id }));

        const poll = () => {
          api
            .getAgentSession(accepted.session_id)
            .then((session) => {
              if (session.status === 'completed') {
                clearTimer();
                setState({
                  status: 'completed',
                  sessionId: session.session_id,
                  steps: session.steps,
                  analysis: buildAgentAnalysis(session, draft.imageUrl ?? null),
                  error: null,
                });
                return;
              }
              if (session.status === 'failed') {
                clearTimer();
                setState({
                  status: 'failed',
                  sessionId: session.session_id,
                  steps: session.steps,
                  analysis: null,
                  error: 'One or more agents failed while processing the report.',
                });
                return;
              }
              setState((prev) => ({ ...prev, steps: session.steps }));
              timerRef.current = window.setTimeout(poll, POLL_INTERVAL_MS);
            })
            .catch((error: unknown) => {
              clearTimer();
              setState((prev) => ({
                ...prev,
                status: 'failed',
                error: error instanceof ApiError ? error.message : 'Could not fetch agent progress',
              }));
            });
        };

        timerRef.current = window.setTimeout(poll, 800);
      })
      .catch((error: unknown) => {
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: error instanceof ApiError ? error.message : 'Could not start the agent pipeline',
        }));
      });
  }, [draft]);

  useEffect(() => {
    start();
    return clearTimer;
  }, [start]);

  return { ...state, retry: start };
}

export { payloadOf };
