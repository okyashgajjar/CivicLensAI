import { useEffect, useState } from 'react';

export function useDuplicateScan(ready: boolean): {
  readonly progress: number;
  readonly scanning: boolean;
  readonly complete: boolean;
} {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!ready) {
      setProgress(0);
      setComplete(false);
      return;
    }
    if (complete) return;

    const id = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 5, 100);
        if (next >= 100) {
          setComplete(true);
          window.clearInterval(id);
        }
        return next;
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [ready, complete]);

  return { progress, scanning: !complete && progress < 100, complete };
}
