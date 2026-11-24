import { useEffect, useState } from 'react';

const KEY = 'snowline.favourites';
const EVENT = 'snowline:favourites';

export const readFavourites = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const write = (ids) => {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
};

export const toggleFavourite = (id) => {
  const ids = readFavourites();
  const next = ids.includes(id) ? ids.filter((item) => item !== id) : [id, ...ids];
  write(next);
  return next.includes(id);
};

export function useFavourites() {
  const [ids, setIds] = useState(readFavourites);

  useEffect(() => {
    const sync = () => setIds(readFavourites());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  return ids;
}