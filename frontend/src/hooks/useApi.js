import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

/** Pide un recurso a la API al montar y expone reload() para volver a pedirlo. Devuelve { data, loading, error, reload }. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get(path, undefined, { signal: controller.signal })
      .then(({ data }) => setState({ data, loading: false, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error: error.message }));
      });
    return () => controller.abort();
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
