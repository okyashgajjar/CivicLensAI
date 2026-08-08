export interface ApiUser {
  readonly id: number;
  readonly email: string;
  readonly username: string | null;
  readonly phone: string | null;
  readonly role: 'user' | 'authority';
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

let authToken: string | null = null;

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
      const data = (await response.json()) as { detail?: string };
      if (data.detail) detail = data.detail;
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(response.status, detail);
  }

  return (await response.json()) as T;
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
    return request<{ url: string }>('/upload', { method: 'POST', formData });
  },

  createReport: (payload: ReportPayload) =>
    request<ApiReport>('/reports', { method: 'POST', body: payload }),

  listReports: () => request<ApiReport[]>('/reports'),

  listIncidents: () => request<ApiIncident[]>('/incidents'),

  updateIncidentStatus: (id: number, status: string) =>
    request<ApiIncident>(`/incidents/${id}`, { method: 'PATCH', body: { status } }),
};
