import { format, parseISO, isValid } from 'date-fns';

export const NZD = (value, opts = {}) =>
  new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits: 0,
    ...opts,
  }).format(Number(value) || 0);

export const num = (value, opts = {}) =>
  new Intl.NumberFormat('en-NZ', { maximumFractionDigits: 0, ...opts }).format(Number(value) || 0);

export const pct = (value, digits = 1) => `${(Number(value) || 0).toFixed(digits)}%`;

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');

export const addDaysISO = (days, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return format(d, 'yyyy-MM-dd');
};

export const curLang = () => (localStorage.getItem('cardrona_lang') === 'en' ? 'en' : 'zh');

const toDate = (value) => {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
};

const locale = () => (curLang() === 'zh' ? 'zh-CN' : 'en-NZ');

export const prettyDate = (value, pattern = 'd MMM yyyy') => {
  const d = toDate(value);
  if (!d) return '—';
  if (curLang() === 'en') return format(d, pattern);
  if (pattern.includes('MMMM')) return new Intl.DateTimeFormat('zh-CN', { month: 'long', year: 'numeric' }).format(d);
  if (pattern === 'MMM yy' || /yy/.test(pattern)) return new Intl.DateTimeFormat('zh-CN', { month: 'short', year: '2-digit' }).format(d);
  if (pattern.startsWith('EEE')) return new Intl.DateTimeFormat('zh-CN', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  return new Intl.DateTimeFormat('zh-CN', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
};

export const prettyDateTime = (value) => {
  const d = toDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: curLang() !== 'zh' }).format(d);
};

export const dayMonth = (value) => {
  const d = toDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short' }).format(d);
};

export const weekdayShort = (value) => {
  const d = toDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(d);
};

export const prettyDateEn = (value, pattern = 'd MMM yyyy') => {
  const d = toDate(value);
  if (!d) return '—';
  return format(d, pattern);
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

export const delta = (current, previous) => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};