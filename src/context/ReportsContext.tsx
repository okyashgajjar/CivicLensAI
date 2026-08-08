import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type ApiReport } from '../api/client';
import { useAuth } from './AuthContext';
import { ACTIVE_REPORTS, type ActiveReport, type ReportEvent, type ReportStatus } from '../data/mockData';
import { formatRelative } from '../utils/time';

interface ReportsContextValue {
  readonly reports: readonly ActiveReport[];
  readonly loading: boolean;
  readonly addReport: (report: ActiveReport) => void;
  readonly updateStatus: (id: string, status: ReportStatus) => void;
  readonly refresh: () => void;
}

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

const STORAGE_KEY = 'civiclens.reports';

const STATUS_MAP: Record<string, ReportStatus> = {
  pending: 'Received',
  in_progress: 'In Progress',
  assigned: 'In Progress',
  resolved: 'Resolved',
};

const EVENT_LABELS: Record<string, string> = {
  pending: 'Reported',
  verified: 'AI Verified',
  in_progress: 'In Progress',
  assigned: 'Assigned',
  resolved: 'Resolved',
};

function mapStatus(status: string): ReportStatus {
  return STATUS_MAP[status] ?? 'Received';
}

function estimateFor(status: ReportStatus): string {
  if (status === 'Resolved') return 'Resolved';
  if (status === 'In Progress') return 'Est. Fix: 48h';
  return 'Pending Schedule';
}

export function toActiveReport(item: ApiReport): ActiveReport {
  const events: readonly ReportEvent[] = (item.events ?? []).map((event, index) => ({
    id: `${item.id}-evt-${index}`,
    label: EVENT_LABELS[event.status] ?? event.status,
    at: event.timestamp,
  }));
  const status = mapStatus(item.status);
  return {
    id: item.id,
    title: item.title,
    address: item.address ?? 'Location on file',
    status,
    reported: formatRelative(item.created_at),
    estimate: estimateFor(status),
    imageUrl: item.image_url,
    aiVerified: true,
    urgent: false,
    events,
  };
}

function defaultEvents(status: ReportStatus): ReportEvent[] {
  const now = Date.now();
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const events: ReportEvent[] = [
    { id: 'reported', label: 'Reported', at: new Date(now - DAY).toISOString() },
    { id: 'verified', label: 'AI Verified', at: new Date(now - DAY + 5 * MIN).toISOString() },
  ];
  if (status === 'In Progress') {
    events.push({ id: 'in-progress', label: 'In Progress', at: new Date(now - 4 * HOUR).toISOString() });
  }
  if (status === 'Resolved') {
    events.push({ id: 'resolved', label: 'Resolved', at: new Date(now - 2 * HOUR).toISOString() });
  }
  return events;
}

function migrateReport(report: ActiveReport): ActiveReport {
  if (report.events && report.events.length > 0) return report;
  return { ...report, events: defaultEvents(report.status) };
}

function readStoredReports(): ActiveReport[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return ACTIVE_REPORTS.map(migrateReport);
    const parsed = JSON.parse(stored) as ActiveReport[];
    return parsed.length > 0 ? parsed.map(migrateReport) : ACTIVE_REPORTS.map(migrateReport);
  } catch {
    return ACTIVE_REPORTS.map(migrateReport);
  }
}

interface ReportsProviderProps {
  readonly children: ReactNode;
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children }) => {
  const { role, token } = useAuth();
  const [reports, setReports] = useState<readonly ActiveReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setReports(readStoredReports());
    setInitialized(true);
  }, [initialized]);

  const persist = (next: readonly ActiveReport[]) => {
    setReports(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const refresh = () => {
    if (role !== 'user' || !token) return;
    setLoading(true);
    api
      .listReports()
      .then((rows) => {
        persist(rows.map(toActiveReport));
      })
      .catch(() => {
        // Backend unavailable: keep the locally cached reports.
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (role === 'user' && token) refresh();
  }, [role, token]);

  const addReport = (report: ActiveReport) => {
    persist([report, ...reports]);
  };

  const updateStatus = (id: string, status: ReportStatus) => {
    persist(reports.map((report) => (report.id === id ? { ...report, status } : report)));
  };

  return (
    <ReportsContext.Provider value={{ reports, loading, addReport, updateStatus, refresh }}>
      {children}
    </ReportsContext.Provider>
  );
};

export function useReports(): ReportsContextValue {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
