import type { ApiDetection } from '../api/client';

const DETECTION_CATEGORY_ID: Record<string, string> = {
  pothole: 'road',
  open_manhole: 'road',
  garbage: 'sanitation',
  waterlogging: 'sanitation',
};

export function detectionCategoryId(detection: ApiDetection | null): string | null {
  if (!detection || !detection.is_issue) return null;
  return DETECTION_CATEGORY_ID[detection.category] ?? null;
}
