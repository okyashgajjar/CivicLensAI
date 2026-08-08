import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { TopAppBar } from '../components/TopAppBar';
import { BottomNav } from '../components/BottomNav';
import { ReportQueueCard } from '../components/dashboard/ReportQueueCard';
import { AssignDialog } from '../components/dashboard/AssignDialog';
import { IncidentMap } from '../components/dashboard/IncidentMap';
import { ProcessingStatus } from '../components/dashboard/ProcessingStatus';
import { CREW_BY_DEPARTMENT, type QueueItem, type QueueStatus, type SeverityLevel } from '../data/mockData';
import { useNotifications } from '../context/NotificationsContext';
import { useIncidents, updateIncidentStatus } from '../hooks/useIncidents';
import type { ApiIncident } from '../api/client';

const TABS = ['Pending', 'Assigned', 'Resolved'] as const;

const nextStatus: Record<QueueStatus, QueueStatus> = {
  Pending: 'Assigned',
  Assigned: 'Resolved',
  Resolved: 'Pending',
};

const STATUS_MAP: Record<string, QueueStatus> = {
  Open: 'Pending',
  'In Progress': 'Assigned',
  Resolved: 'Resolved',
};

const DEPARTMENT_BY_CATEGORY: Record<string, string> = {
  Roads: 'Roads & Infrastructure',
  Traffic: 'Roads & Infrastructure',
  Lighting: 'Street Lighting',
  Sanitation: 'Sanitation & Waste',
  Drainage: 'Drainage & Flood',
  Parks: 'Parks & Public Space',
};

interface DashboardPageProps {
  readonly className?: string;
}

function toQueueItem(
  incident: ApiIncident,
  assignment: { department: string; crew: string } | undefined,
): QueueItem {
  const status = STATUS_MAP[incident.status] ?? 'Pending';
  const department = assignment?.department ?? DEPARTMENT_BY_CATEGORY[incident.category] ?? 'Roads & Infrastructure';
  const crew = assignment?.crew ?? CREW_BY_DEPARTMENT[department]?.[0] ?? 'Crew A';
  return {
    id: String(incident.id),
    type: incident.title,
    title: incident.title,
    address: `${incident.lat.toFixed(4)}, ${incident.lng.toFixed(4)}`,
    severity: incident.severity as SeverityLevel,
    aiSummary: incident.description,
    imageUrl: incident.image_url ?? '',
    status,
    assignedTo: status === 'Assigned' ? department : undefined,
    assignedCrew: status === 'Assigned' ? crew : undefined,
  };
}

export const DashboardPage: React.FC<DashboardPageProps> = () => {
  const { incidents, status, refetch } = useIncidents();
  const [assignments, setAssignments] = useState<Record<string, { department: string; crew: string }>>({});
  const [activeTab, setActiveTab] = useState<QueueStatus>('Pending');
  const [assigningItem, setAssigningItem] = useState<QueueItem | null>(null);
  const { addNotification } = useNotifications();

  const queue = useMemo(
    () => incidents.map((incident) => toQueueItem(incident, assignments[String(incident.id)])),
    [incidents, assignments],
  );

  const visibleItems = queue.filter((item) => item.status === activeTab);
  const counts: Record<QueueStatus, number> = {
    Pending: queue.filter((item) => item.status === 'Pending').length,
    Assigned: queue.filter((item) => item.status === 'Assigned').length,
    Resolved: queue.filter((item) => item.status === 'Resolved').length,
  };

  const handleAdvance = async (id: string) => {
    const item = queue.find((entry) => entry.id === id);
    if (!item) return;
    const next = nextStatus[item.status];
    const backendStatus = next === 'Pending' ? 'Open' : 'Resolved';
    if (next === 'Pending') {
      setAssignments((prev) => {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      });
    }
    await updateIncidentStatus(Number(id), backendStatus);
  };

  const handleAssign = async (department: string, crew: string) => {
    if (!assigningItem) return;
    setAssignments((prev) => ({ ...prev, [assigningItem.id]: { department, crew } }));
    await updateIncidentStatus(Number(assigningItem.id), 'In Progress');
    addNotification({
      title: 'Report assigned to crew',
      body: `Your '${assigningItem.title}' report was assigned to ${department} (${crew}).`,
      time: 'Just now',
      icon: 'engineering',
      to: '/reports',
    });
    setAssigningItem(null);
  };

  return (
    <div className="min-h-screen">
      <TopAppBar />
      <main className="pt-[72px] pb-[96px] md:pb-[40px] max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop w-full flex flex-col gap-6">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-4">
          <div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
              Report Queue
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              AI-prioritized issues requiring municipal attention.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-error-container text-on-error-container px-4 py-2 rounded-lg flex flex-col shadow-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Critical</span>
              <span className="font-title-md text-title-md">
                {queue.filter((item) => item.severity === 'CRITICAL').length}
              </span>
            </div>
            <div className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg flex flex-col shadow-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Pending</span>
              <span className="font-title-md text-title-md">{counts.Pending}</span>
            </div>
          </div>
        </section>

        <div className="flex border-b border-outline-variant w-full overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 border-b-2 font-title-md text-title-md whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-7 flex flex-col gap-4">
            {status === 'loading' ? (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-surface-container-lowest rounded-xl border border-outline-variant/20 px-6">
                <Icon name="hourglass_top" className="text-3xl text-primary animate-spin" />
                <p className="font-body-md text-body-md text-on-surface-variant">Loading the report queue…</p>
              </div>
            ) : status === 'error' ? (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-surface-container-lowest rounded-xl border border-outline-variant/20 px-6">
                <Icon name="cloud_off" className="text-3xl text-on-surface-variant" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Couldn&apos;t load the report queue. Is the server running?
                </p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : visibleItems.length > 0 ? (
              visibleItems.map((item) => (
                <ReportQueueCard
                  key={item.id}
                  item={item}
                  onAdvance={handleAdvance}
                  onAssign={setAssigningItem}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-surface-container-lowest rounded-xl border border-outline-variant/20 px-6">
                <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
                  <Icon name="fact_check" className="text-3xl text-on-surface-variant" />
                </div>
                <h3 className="font-title-md text-title-md text-on-surface">No {activeTab.toLowerCase()} items</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                  There are no {activeTab.toLowerCase()} issues in the queue right now.
                </p>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            <IncidentMap expandTo="/activity-map" />
            <ProcessingStatus />
          </div>
        </div>
      </main>
      <BottomNav />
      <AssignDialog item={assigningItem} onClose={() => setAssigningItem(null)} onConfirm={handleAssign} />
    </div>
  );
};
