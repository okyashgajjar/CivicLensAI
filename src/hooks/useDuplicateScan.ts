import { useEffect, useState } from 'react';
import { api, type ApiDuplicateMatch } from '../api/client';

interface DuplicateScanOptions {
  readonly ready: boolean;
  readonly lat: number;
  readonly lng: number;
}

export function useDuplicateScan(options: DuplicateScanOptions): {
  readonly progress: number;
  readonly scanning: boolean;
  readonly complete: boolean;
  readonly matches: readonly ApiDuplicateMatch[];
  readonly error: string | null;
} {
  const { ready, lat, lng } = options;
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [matches, setMatches] = useState<readonly ApiDuplicateMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) {
      setProgress(0);
      setComplete(false);
      setMatches([]);
      setError(null);
      return;
    }

    setProgress(0);
    setComplete(false);
    setMatches([]);
    setError(null);

    let cancelled = false;
    const id = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + 8, 85));
    }, 180);

    api
      .scanDuplicates(lat, lng)
      .then((result) => {
        if (cancelled) return;
        setMatches(result.matches);
        setProgress(100);
        setComplete(true);
        window.clearInterval(id);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Duplicate scan could not complete');
        setProgress(100);
        setComplete(true);
        window.clearInterval(id);
      });

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [ready, lat, lng]);

  return { progress, scanning: !complete && progress < 100, complete, matches, error };
}
