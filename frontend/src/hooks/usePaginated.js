import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

/**
 * Pide una lista paginada al backend (?page=N) y guarda la página actual.
 * Si cambian la ruta o los filtros vuelve a la página 1.
 * Devuelve { items, meta, page, setPage, loading, error, reload, patch }.
 */
export function usePaginated(path, params = {}, { enabled = true } = {}) {
  const key = JSON.stringify([path, params]);
  const [pageState, setPageState] = useState({ key, page: 1 });
  const [result, setResult] = useState({ items: [], meta: null, loading: enabled, error: '' });
  const [tick, setTick] = useState(0);

  const page = pageState.key === key ? pageState.page : 1;
  const setPage = useCallback((next) => setPageState({ key, page: next }), [key]);

  useEffect(() => {
    if (!enabled) return undefined;
    const [url, query] = JSON.parse(key);
    const controller = new AbortController();
    setResult((r) => ({ ...r, loading: true, error: '' }));

    api
      .get(url, { ...query, page }, { signal: controller.signal })
      .then(({ data, meta }) => {
        // Se borró el último elemento de la última página: retrocede una.
        if (data.length === 0 && meta.last_page >= 1 && page > meta.last_page) {
          setPageState({ key, page: meta.last_page });
          return;
        }
        setResult({ items: data, meta, loading: false, error: '' });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setResult((r) => ({ ...r, loading: false, error: error.message }));
      });

    return () => controller.abort();
  }, [key, page, tick, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  /** Cambia un elemento en pantalla sin volver a pedir la página. */
  const patch = useCallback((id, changes) => {
    setResult((r) => ({ ...r, items: r.items.map((item) => (item.id === id ? { ...item, ...changes } : item)) }));
  }, []);

  return { ...result, page, setPage, reload, patch };
}

/** Devuelve `value` con retraso: sirve para no pedir al servidor en cada tecla. */
export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
