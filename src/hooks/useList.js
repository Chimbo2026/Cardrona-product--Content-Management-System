import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Loads a collection from an entity. Returns { items, loading, reload }.
 * options: { sort, limit, ... } passed through to the SDK.
 *
 * Results are cached in-memory for 60s so that navigating between
 * pages (or StrictMode double-mounts) does not re-hit the API and
 * exhaust the per-caller rate limit.
 */
export const entityCache = new Map();
const CACHE_TTL = 60 * 1000;

export function readEntityCached(entityName, query, options) {
  const key = `${entityName}::${JSON.stringify(query)}::${JSON.stringify(options)}`;
  const hit = entityCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.items;
  return null;
}

export async function fetchEntity(entityName, query, options, force = false) {
  const key = `${entityName}::${JSON.stringify(query)}::${JSON.stringify(options)}`;
  const hit = entityCache.get(key);
  if (!force && hit && Date.now() - hit.at < CACHE_TTL) return hit.items;
  const result = await base44.entities[entityName].filter(query, options);
  const items = Array.isArray(result) ? result : result?.items || [];
  entityCache.set(key, { at: Date.now(), items });
  return items;
}

export default function useList(entityName, query = {}, options = { limit: 500 }) {
  const [items, setItems] = useState(() => readEntityCached(entityName, query, options) || []);
  const [loading, setLoading] = useState(!readEntityCached(entityName, query, options));
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const queryKey = JSON.stringify(query);
  const optionsKey = JSON.stringify(options);

  const load = useCallback(
    async (force = false) => {
      const cached = !force && readEntityCached(entityName, JSON.parse(queryKey), JSON.parse(optionsKey));
      if (cached) {
        setItems(cached);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      try {
        const result = await fetchEntity(entityName, JSON.parse(queryKey), JSON.parse(optionsKey), true);
        setItems(result);
        setError(null);
      } catch (e) {
        setError(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [entityName, queryKey, optionsKey]
  );

  useEffect(() => {
    load(tick > 0);
  }, [load, tick]);

  return { items, loading, error, reload: () => setTick((t) => t + 1) };
}