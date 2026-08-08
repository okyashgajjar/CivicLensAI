import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from '../components/Icon';
import { ImagePreview } from '../components/review/ImagePreview';
import { AiAssessment } from '../components/review/AiAssessment';
import { DuplicateAlert } from '../components/review/DuplicateAlert';
import { SeverityVotes } from '../components/review/SeverityVotes';
import { AgentAnalysis } from '../components/review/AgentAnalysis';
import { ReviewActionBar } from '../components/review/ReviewActionBar';
import { useReports, toActiveReport } from '../context/ReportsContext';
import { useNotifications } from '../context/NotificationsContext';
import { api, ApiError, type ApiAgentAnalysis } from '../api/client';
import { useAgentPipeline } from '../hooks/useAgentPipeline';
import type { ReportDraft } from '../types/report';

interface ReviewPageProps {
  readonly className?: string;
}

export const ReviewPage: React.FC<ReviewPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { draft?: ReportDraft; analysis?: ApiAgentAnalysis } | null;
  const draft = state?.draft;
  const passedAnalysis = state?.analysis ?? null;
  const { addReport } = useReports();
  const { addNotification } = useNotifications();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // When the user arrived from the agents page, the analysis is already
  // complete; otherwise run the pipeline live (e.g. direct navigation).
  const pipeline = useAgentPipeline(passedAnalysis ? null : draft);
  const agentAnalysis = passedAnalysis ?? pipeline.analysis;
  const agentLoading = pipeline.status === 'starting' || pipeline.status === 'running';
  const agentError = passedAnalysis ? null : pipeline.error;

  const handleConfirm = async () => {
    if (!draft || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await api.createReport({
        title: draft.title,
        category: draft.category,
        description: draft.description,
        address: draft.address,
        lat: draft.lat ?? undefined,
        lng: draft.lng ?? undefined,
        image_url: draft.imageUrl ?? undefined,
      });
      addReport(toActiveReport(created));
      addNotification({
        title: 'Report submitted successfully',
        body: `Your ${draft.category} report was received and is being routed to the city.`,
        time: 'Just now',
        icon: 'task_alt',
        to: '/reports',
      });
      navigate('/reports');
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Failed to submit report');
      setSubmitting(false);
    }
  };

  const handleDuplicate = () => {
    addNotification({
      title: 'Report merged as duplicate',
      body: 'Your report was merged with an existing issue to avoid duplicates. Track the original in My Reports.',
      time: 'Just now',
      icon: 'merge',
      to: '/reports',
    });
    navigate('/reports');
  };

  if (!draft) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
          <Icon name="edit_note" className="text-3xl text-on-surface-variant" />
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">No draft to review</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          Start a new report first, then confirm your details here.
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
    <div className="min-h-screen flex flex-col relative">
      <header className="flex items-center px-margin-mobile py-4 bg-surface shadow-sm z-20 sticky top-0 border-b border-surface-container-highest">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container-high transition-colors text-on-surface"
          onClick={() => navigate('/report')}
          aria-label="Close"
        >
          <Icon name="close" />
        </button>
        <h1 className="font-title-md text-title-md ml-2 text-on-surface">Review Analysis</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-margin-mobile py-6 space-y-6 pb-40">
        <ImagePreview imageUrl={draft.imageUrl} />
        <AiAssessment detection={draft.detection} />
        <DuplicateAlert duplicates={draft.duplicates ?? []} />
        <SeverityVotes detection={draft.detection} duplicates={draft.duplicates ?? []} />
        <AgentAnalysis loading={agentLoading} analysis={agentAnalysis} error={agentError} />

        <section className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-gutter">
          <h2 className="font-title-md text-title-md text-on-surface mb-3">Report Summary</h2>
          <dl className="flex flex-col gap-2">
            <div className="flex justify-between gap-4">
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Category</dt>
              <dd className="font-body-md text-body-md text-on-surface text-right">{draft.category}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Location</dt>
              <dd className="font-body-md text-body-md text-on-surface text-right">{draft.address}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Description</dt>
              <dd className="font-body-md text-body-md text-on-surface text-right">{draft.description}</dd>
            </div>
          </dl>
        </section>

        {submitError ? (
          <div className="flex items-center gap-2 bg-error-container rounded-lg px-4 py-3">
            <Icon name="error" className="text-error text-[18px] shrink-0" />
            <p className="font-label-sm text-label-sm text-error">{submitError}</p>
          </div>
        ) : null}
      </main>

      <ReviewActionBar
        submitting={submitting}
        onConfirm={() => {
          void handleConfirm();
        }}
        onMarkDuplicate={handleDuplicate}
      />
    </div>
  );
};
