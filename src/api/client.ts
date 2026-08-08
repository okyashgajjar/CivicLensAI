export interface ApiUser {
  readonly id: number;
  readonly email: string;
  readonly username: string | null;
  readonly phone: string | null;
  readonly role: 'user' | 'authority';
}

export interface ApiQueueItem {
  readonly id: string;
  readonly source: 'incident' | 'report';
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly address: string | null;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly image_url: string | null;
  readonly severity: string;
  readonly status: string;
  readonly reporter_email: string | null;
  readonly created_at: string;
}

export interface ApiIncident {
  readonly id: number;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly status: string;
  readonly severity: string;
  readonly image_url: string | null;
  readonly lat: number;
  readonly lng: number;
  readonly updated_at: string;
}

export interface ApiReportEvent {
  readonly status: string;
  readonly timestamp: string;
}

export interface ApiReport {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly address: string | null;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly image_url: string | null;
  readonly status: string;
  readonly reporter_email: string;
  readonly created_at: string;
  readonly events: readonly ApiReportEvent[];
}

export interface ApiDetection {
  readonly category: string;
  readonly label: string;
  readonly confidence: number;
  readonly severity: string;
  readonly is_issue: boolean;
}

export interface ApiUploadResult {
  readonly url: string;
  readonly detection: ApiDetection | null;
}

export interface ApiDuplicateMatch {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly severity: string;
  readonly status: string;
  readonly address: string | null;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly source: 'incident' | 'report';
}

export interface ApiDuplicateScanResult {
  readonly matches: readonly ApiDuplicateMatch[];
}

export interface ApiAgentClassification {
  readonly category: string;
  readonly label: string;
  readonly confidence: number | null;
  readonly severity: string;
  readonly is_issue: boolean;
  readonly confidence_good: boolean;
  readonly reasoning: string;
}

export interface ApiAgentDuplicateMatch {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly severity: string;
  readonly status: string;
  readonly source: string;
  readonly address: string | null;
  readonly distance_m: number | null;
}

export interface ApiAgentDuplication {
  readonly is_duplicate: boolean;
  readonly matches: readonly ApiAgentDuplicateMatch[];
  readonly reasoning: string;
}

export interface ApiAgentRouting {
  readonly department: string;
  readonly subdepartment: string | null;
  readonly priority: string;
  readonly reasoning: string;
}

export interface ApiAgentSummary {
  readonly summary: string;
  readonly key_points: readonly string[];
  readonly recommended_action: string;
}

export interface ApiAgentAnalysis {
  readonly session_id: string;
  readonly image_url: string | null;
  readonly classification: ApiAgentClassification;
  readonly duplication: ApiAgentDuplication;
  readonly routing: ApiAgentRouting;
  readonly summary: ApiAgentSummary;
  readonly errors: readonly string[];
}

export interface AuthResponse {
  readonly token: string;
  readonly user: ApiUser;
}

export interface RegisterPayload {
  readonly username: string;
  readonly password: string;
  readonly phone: string;
}

export interface ReportPayload {
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly address?: string;
  readonly lat?: number;
  readonly lng?: number;
  readonly image_url?: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const BASE_URL = '/api';

const TOKEN_STORAGE_KEY = 'civiclens.token';

let authToken: string | null = null;
try {
  authToken = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
} catch {
  authToken = null;
}

export function setAuthToken(next: string | null): void {
  authToken = next;
}

export function getAuthToken(): string | null {
  return authToken;
}

interface RequestOptions {
  readonly method?: string;
  readonly body?: unknown;
  readonly formData?: FormData;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  let payload: BodyInit | undefined;
  if (options.formData) {
    payload = options.formData;
  } else if (options.body !== undefined) {
    payload = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: payload,
    });
  } catch {
    throw new ApiError(0, 'Unable to reach the CivicLens server');
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { detail?: unknown };
      if (data.detail !== undefined) detail = formatErrorDetail(data.detail);
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(response.status, detail);
  }

  return (await response.json()) as T;
}

function formatErrorDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((entry) => (entry && typeof entry === 'object' && 'msg' in entry ? String(entry.msg) : null))
      .filter((message): message is string => Boolean(message));
    if (messages.length > 0) return messages.join('; ');
  }
  if (detail && typeof detail === 'object' && 'message' in detail) {
    return String(detail.message);
  }
  return 'Request failed';
}

export const api = {
  login: (identifier: string, password: string, phone?: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { identifier, password, phone } }),

  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: payload }),

  resetPassword: (payload: { readonly identifier: string; readonly phone: string; readonly new_password: string }) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', { method: 'POST', body: payload }),

  me: () => request<ApiUser>('/auth/me'),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ApiUploadResult>('/upload', { method: 'POST', formData });
  },

  scanDuplicates: (lat: number, lng: number) =>
    request<ApiDuplicateScanResult>(`/reports/duplicates?lat=${lat}&lng=${lng}`),

  analyzeReport: (payload: {
    readonly lat: number;
    readonly lng: number;
    readonly category: string;
    readonly location: string;
    readonly description: string;
    readonly imageUrl: string | null;
  }) => {
    const formData = new FormData();
    formData.append('lat', String(payload.lat));
    formData.append('lng', String(payload.lng));
    formData.append('category', payload.category);
    formData.append('location', payload.location);
    formData.append('description', payload.description);
    if (payload.imageUrl) formData.append('image_url', payload.imageUrl);
    return request<ApiAgentAnalysis>('/reports/analyze', { method: 'POST', formData });
  },

  getAgentSession: (sessionId: string) =>
    request<{ readonly session_id: string; readonly steps: readonly { readonly step: string; readonly payload: object }[] }>(
      `/reports/analyze/${sessionId}`,
    ),

  createReport: (payload: ReportPayload) =>
    request<ApiReport>('/reports', { method: 'POST', body: payload }),

  listReports: () => request<ApiReport[]>('/reports'),

  listQueue: () => request<ApiQueueItem[]>('/reports/queue'),

  updateQueueStatus: (source: string, id: string, status: string) =>
    request<ApiQueueItem>(`/reports/queue/${source}/${id}`, { method: 'PATCH', body: { status } }),

  listIncidents: () => request<ApiIncident[]>('/incidents'),

  updateIncidentStatus: (id: number, status: string) =>
    request<ApiIncident>(`/incidents/${id}`, { method: 'PATCH', body: { status } }),
};
