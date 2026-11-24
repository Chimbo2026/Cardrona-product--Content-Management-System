import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';

const TONES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  ice: 'bg-ice-50 text-ice-800 ring-ice-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/15',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/15',
};

const DOTS = {
  green: 'bg-emerald-500',
  ice: 'bg-ice-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
  slate: 'bg-slate-400',
  violet: 'bg-violet-500',
};

const STATUS_TONE = {
  open: 'green',
  active: 'green',
  available: 'green',
  completed: 'green',
  paid: 'green',
  confirmed: 'green',
  'on duty': 'green',
  'on time': 'green',
  returned: 'green',
  resolved: 'green',
  running: 'green',
  'checked in': 'green',
  'in progress': 'amber',
  processing: 'amber',
  pending: 'amber',
  delayed: 'amber',
  'on hold': 'amber',
  cleaning: 'amber',
  fair: 'amber',
  'partially paid': 'amber',
  'partially redeemed': 'amber',
  redeemed: 'red',
  approved: 'green',
  processed: 'green',
  rejected: 'red',
  onboarding: 'amber',
  paused: 'slate',
  'low stock': 'amber',
  'sold out': 'amber',
  issued: 'ice',
  scheduled: 'ice',
  reserved: 'ice',
  booked: 'ice',
  'in service': 'ice',
  investigating: 'violet',
  closed: 'red',
  cancelled: 'red',
  overdue: 'red',
  critical: 'red',
  damaged: 'red',
  absent: 'red',
  'no-show': 'red',
  expired: 'red',
  failed: 'red',
  'manual required': 'violet',
  high: 'red',
  unused: 'slate',
  'off duty': 'slate',
  retired: 'slate',
  draft: 'slate',
  'on leave': 'slate',
  'not started': 'slate',
  'ready for arrival': 'green',
  published: 'green',
};

export function getTone(status) {
  return STATUS_TONE[String(status || '').toLowerCase()] || 'slate';
}

export default function StatusBadge({ status, dot = true, className }) {
  const { lang } = useLang();
  const tone = getTone(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap',
        TONES[tone],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOTS[tone])} />}
      {status ? tx(status, lang) : '—'}
    </span>
  );
}

export { TONES, DOTS };