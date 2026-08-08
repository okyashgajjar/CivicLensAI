export interface ReportDraft {
  readonly title: string;
  readonly categoryId: string;
  readonly category: string;
  readonly description: string;
  readonly address: string;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly imageUrl: string | null;
}
