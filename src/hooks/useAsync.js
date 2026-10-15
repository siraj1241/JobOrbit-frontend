/**
 * useAsync — generic hook for tracking async operation state.
 *
 * Keeps component code clean by centralizing the { data, error, loading, run }
 * pattern. Each call to `run` cancels any previous run's result so the UI
 * never shows stale data.
 *
 *   const { data, loading, error, run } = useAsync(searchJobs, { args: [{ page: 1 }] });
 *
 * @template T
 * @param {(...args) => Promise<T>} asyncFn
 * @param {{ args?: any[], immediate?: boolean }} [opts]
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsync(asyncFn, opts = {}) {
  const { args = [], immediate = true } = opts;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const requestId = useRef(0);

  const run = useCallback(
    async (...callArgs) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...(callArgs.length ? callArgs : args));
        if (id === requestId.current) setData(result);
        return result;
      } catch (err) {
        if (id === requestId.current) setError(err);
        throw err;
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFn, ...args]
  );

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return { data, error, loading, run, setData, setError };
}

export default useAsync;
