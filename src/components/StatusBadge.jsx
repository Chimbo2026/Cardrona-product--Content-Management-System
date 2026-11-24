import { STATUS_META } from '@/lib/booking';
import { statusLabel } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function StatusBadge({ status, className = '' }) {
  const { lang, bi } = useLanguage();
  const meta = STATUS_META[status] || {
    tone: 'border-slate-200 bg-slate-100 text-slate-600',
  };
  const label = STATUS_META[status]
    ? statusLabel(status, lang)
    : status || bi('未知', 'Unknown');

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] ${meta.tone} ${className}`}
    >
      {label}
    </span>
  );
}