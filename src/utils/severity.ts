export function severityClasses(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-error-container text-on-error-container';
    case 'MEDIUM':
      return 'bg-secondary-fixed text-on-secondary-fixed-variant';
    case 'LOW':
      return 'bg-success-container text-success';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

const SEVERITY_RANK: Record<string, number> = { LOW: 0, MEDIUM: 1, CRITICAL: 2 };

export interface SeverityVoteCount {
  readonly severity: string;
  readonly count: number;
}

export function aggregateSeverity(votes: readonly string[]): string | null {
  if (votes.length === 0) return null;
  return votes.reduce((highest, current) => {
    const rank = (value: string): number => SEVERITY_RANK[value] ?? -1;
    return rank(current) > rank(highest) ? current : highest;
  });
}

export function countSeverityVotes(votes: readonly string[]): readonly SeverityVoteCount[] {
  const counts = new Map<string, number>();
  for (const vote of votes) {
    counts.set(vote, (counts.get(vote) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([severity, count]) => ({ severity, count }))
    .sort((a, b) => (SEVERITY_RANK[b.severity] ?? -1) - (SEVERITY_RANK[a.severity] ?? -1));
}
