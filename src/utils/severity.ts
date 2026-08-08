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
