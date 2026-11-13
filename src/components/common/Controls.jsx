import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

export function SelectNative({ value, onChange, options = [], className, ariaLabel, includeAll, allLabel }) {
  const { t } = useLang();
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-9 rounded-lg border border-border bg-white px-2.5 pr-8 text-[12.5px] font-medium text-forest-900 shadow-sm outline-none transition-colors focus:border-ice-400 focus:ring-2 focus:ring-ice-200',
        className
      )}
    >
      {includeAll && <option value="All">{allLabel || t('全部', 'All')}</option>}
      {normalized.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SearchInput({ value, onChange, placeholder, className }) {
  const { t } = useLang();
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('搜索…', 'Search…')}
        className="h-9 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-[12.5px] text-forest-900 shadow-sm outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ice-400 focus:ring-2 focus:ring-ice-200"
      />
    </div>
  );
}

export function DemoChip({ children, className }) {
  const { t } = useLang();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-ice-200 bg-ice-50 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ice-800',
        className
      )}
    >
      {children || t('演示数据', 'Demonstration data')}
    </span>
  );
}