import { useLanguage } from '@/lib/i18n/LanguageContext';

const TYPES = [
  { key: 'all', zh: '全部', en: 'All' },
  { key: 'ski', zh: '滑雪预订', en: 'Ski passes' },
  { key: 'shop', zh: '山地商店', en: 'Mountain store' },
];

const STATUS_FILTERS = [
  { key: 'all', zh: '全部状态', en: 'All statuses', statuses: null },
  {
    key: 'pending',
    zh: '待处理',
    en: 'Pending',
    statuses: ['pending_payment', 'reschedule_requested', 'refund_requested'],
  },
  { key: 'completed', zh: '已完成', en: 'Completed', statuses: ['confirmed', 'used', 'shipped'] },
  { key: 'cancelled', zh: '已取消', en: 'Cancelled', statuses: ['cancelled', 'refunded'] },
];

export const matchStatus = (status, key) => {
  const group = STATUS_FILTERS.find((item) => item.key === key);
  if (!group || !group.statuses) return true;
  return group.statuses.includes(status);
};

export default function OrderFilters({
  type,
  onType,
  status,
  onStatus,
  from,
  to,
  onFrom,
  onTo,
}) {
  const { lang, bi } = useLanguage();
  const field = (item) => (lang === 'en' ? item.en : item.zh);
  const hasDates = Boolean(from || to);

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1.5">
        {TYPES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onType(item.key)}
            className={`rounded-full px-3.5 py-1.5 text-[11.5px] transition ${
              type === item.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {field(item)}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onStatus(item.key)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition ${
              status === item.key
                ? 'border-primary/40 bg-primary/10 font-medium text-primary'
                : 'border-border bg-card text-muted-foreground'
            }`}
          >
            {field(item)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2">
        <span className="shrink-0 text-[10.5px] text-muted-foreground">
          {bi('下单日期', 'Order date')}
        </span>
        <input
          type="date"
          value={from}
          onChange={(event) => onFrom(event.target.value)}
          className="h-7 min-w-0 flex-1 rounded-md bg-secondary px-1.5 text-[11px] text-foreground outline-none"
          aria-label={bi('开始日期', 'From date')}
        />
        <span className="text-[10.5px] text-muted-foreground">–</span>
        <input
          type="date"
          value={to}
          onChange={(event) => onTo(event.target.value)}
          className="h-7 min-w-0 flex-1 rounded-md bg-secondary px-1.5 text-[11px] text-foreground outline-none"
          aria-label={bi('结束日期', 'To date')}
        />
        {hasDates && (
          <button
            type="button"
            onClick={() => {
              onFrom('');
              onTo('');
            }}
            className="shrink-0 text-[10.5px] text-primary"
          >
            {bi('清除', 'Clear')}
          </button>
        )}
      </div>
    </div>
  );
}