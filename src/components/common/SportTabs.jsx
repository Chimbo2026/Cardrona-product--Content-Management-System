import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

const TABS = [
  { value: 'All', zh: '全部', en: 'All' },
  { value: 'Ski', zh: '滑雪', en: 'Ski' },
  { value: 'Bike', zh: '单车', en: 'Bike' },
];

export default function SportTabs({ value, onChange, className }) {
  const { t } = useLang();
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-lg border border-border bg-white p-1 shadow-sm', className)}>
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-md px-3 py-1 text-[12px] font-semibold transition-colors',
            value === tab.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {t(tab.zh, tab.en)}
        </button>
      ))}
    </div>
  );
}