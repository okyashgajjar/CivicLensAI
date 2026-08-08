import { Icon } from '../Icon';
import type { ReportDetection, ReportDuplicate } from '../../types/report';
import { aggregateSeverity, countSeverityVotes, severityClasses } from '../../utils/severity';

interface SeverityVotesProps {
  readonly className?: string;
  readonly detection?: ReportDetection | null;
  readonly duplicates?: readonly ReportDuplicate[];
}

interface SeverityVoteEntry {
  readonly source: string;
  readonly severity: string;
}

export const SeverityVotes: React.FC<SeverityVotesProps> = ({ detection, duplicates = [] }) => {
  const votes: SeverityVoteEntry[] = [];
  if (detection && detection.is_issue) {
    votes.push({ source: 'AI image detection', severity: detection.severity });
  }
  for (const duplicate of duplicates) {
    votes.push({ source: `Existing issue: ${duplicate.title}`, severity: duplicate.severity });
  }

  if (votes.length === 0) return null;

  const finalSeverity = aggregateSeverity(votes.map((vote) => vote.severity)) ?? 'LOW';
  const breakdown = countSeverityVotes(votes.map((vote) => vote.severity));

  return (
    <section className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-gutter shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
      <h2 className="font-title-md text-title-md text-on-surface mb-3 flex items-center gap-2">
        <Icon name="how_to_vote" className="text-primary" />
        Severity Votes
      </h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-4">
        Community severity is voted from the AI detection and any open issues at the same location.
      </p>

      <div className="flex flex-col gap-2 mb-4">
        {votes.map((vote, index) => (
          <div
            key={`${vote.source}-${index}`}
            className="flex items-center justify-between gap-3 bg-surface rounded-lg px-4 py-2.5 border border-outline-variant/40"
          >
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{vote.source}</span>
            <span className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm ${severityClasses(vote.severity)}`}>
              {vote.severity}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {breakdown.map(({ severity, count }) => (
          <div key={severity} className="flex items-center gap-2">
            <span className="w-20 font-label-sm text-label-sm text-on-surface-variant">{severity}</span>
            <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(count / votes.length) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right font-label-sm text-label-sm text-on-surface-variant">{count}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-outline-variant/40 flex items-center justify-between gap-3">
        <span className="font-label-sm text-label-sm text-on-surface-variant">Final reported severity</span>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm ${severityClasses(
            finalSeverity,
          )}`}
        >
          <Icon name="warning" filled className="text-[16px]" />
          {finalSeverity}
        </span>
      </div>
    </section>
  );
};
