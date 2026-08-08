import { useSyncExternalStore } from 'react';
import { api, type ApiIncident } from '../api/client';

export type IncidentsStatus = 'loading' | 'ready' | 'error';

let incidents: readonly ApiIncident[] = [];
let loadState: IncidentsStatus = 'loading';
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getIncidentsSnapshot(): readonly ApiIncident[] {
  return incidents;
}

export function getIncidentsStatusSnapshot(): IncidentsStatus {
  return loadState;
}

function load(): Promise<void> {
  if (inflight) return inflight;
  loadState = 'loading';
  emit();
  inflight = api
    .listIncidents()
    .then((rows) => {
      incidents = rows;
      loadState = 'ready';
    })
    .catch(() => {
      loadState = 'error';
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function refetchIncidents(): void {
  void load();
}

export async function updateIncidentStatus(id: number, status: string): Promise<void> {
  await api.updateIncidentStatus(id, status);
  await load();
}

export function useIncidents(): {
  readonly incidents: readonly ApiIncident[];
  readonly status: IncidentsStatus;
  readonly refetch: () => void;
} {
  useSyncExternalStore(subscribe, getIncidentsSnapshot);
  useSyncExternalStore(subscribe, getIncidentsStatusSnapshot);
  return { incidents, status: loadState, refetch: refetchIncidents };
}

void load();
