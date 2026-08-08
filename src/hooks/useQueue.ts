import { useEffect, useSyncExternalStore } from 'react';
import { api, type ApiQueueItem } from '../api/client';

export type QueueStatus = 'loading' | 'ready' | 'error';

let queue: readonly ApiQueueItem[] = [];
let loadState: QueueStatus = 'loading';
let inflight: Promise<void> | null = null;
let loadStarted = false;
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

export function getQueueSnapshot(): readonly ApiQueueItem[] {
  return queue;
}

export function getQueueStatusSnapshot(): QueueStatus {
  return loadState;
}

function load(): Promise<void> {
  if (inflight) return inflight;
  loadState = 'loading';
  emit();
  inflight = api
    .listQueue()
    .then((rows) => {
      queue = rows;
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

export function refetchQueue(): void {
  void load();
}

export async function updateQueueStatus(source: string, id: string, status: string): Promise<void> {
  await api.updateQueueStatus(source, id, status);
  await load();
}

export function useQueue(): {
  readonly items: readonly ApiQueueItem[];
  readonly status: QueueStatus;
  readonly refetch: () => void;
} {
  useSyncExternalStore(subscribe, getQueueSnapshot);
  useSyncExternalStore(subscribe, getQueueStatusSnapshot);
  useEffect(() => {
    if (!loadStarted) {
      loadStarted = true;
      void load();
    }
  }, []);
  return { items: queue, status: loadState, refetch: refetchQueue };
}
