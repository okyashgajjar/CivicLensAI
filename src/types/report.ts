export interface ReportDetection {
  readonly category: string;
  readonly label: string;
  readonly confidence: number;
  readonly severity: string;
  readonly is_issue: boolean;
}

export interface ReportDraft {
  readonly title: string;
  readonly categoryId: string;
  readonly category: string;
  readonly description: string;
  readonly address: string;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly imageUrl: string | null;
  readonly detection: ReportDetection | null;
}
