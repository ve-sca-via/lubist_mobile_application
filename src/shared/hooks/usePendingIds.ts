import { useCallback, useMemo, useState } from 'react';

const EMPTY: ReadonlySet<string> = new Set();

/**
 * Tracks which ids have a request in flight, so a list can disable just the
 * tapped row's button instead of every button while any one request is
 * pending (which felt like lag when tapping quickly).
 *
 * `add` / `remove` are stable, so they're safe to use in memoized callbacks.
 */
export function usePendingIds() {
  const [ids, setIds] = useState<ReadonlySet<string>>(EMPTY);

  const add = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return useMemo(() => ({ ids, add, remove }), [ids, add, remove]);
}
