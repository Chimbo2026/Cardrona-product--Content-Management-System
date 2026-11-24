import { Link } from 'react-router-dom';
import { CalendarClock, CreditCard } from 'lucide-react';
import { QUICK_FILTERS } from '@/lib/bookingQuickFilters';
import { useLang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function BookingManagementHeader({ value, onChange }) {
  const { lang, t } = useLang();

  return (
    <section className="mb-5 rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-[0_1px_2px_rgba(15,42,34,0.04)] sm:px-6">
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700 ring-1 ring-inset ring-forest-600/10">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-heading text-[22px] font-semibold leading-tight text-forest-950">
              {t('预订管理', 'Booking management')}
            </h1>
            <Link
              to="/payments"
              className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/15 bg-white px-3 py-1.5 text-[12px] font-medium text-forest-800 transition-colors hover:border-forest-900/35 hover:bg-forest-50"
            >
              <CreditCard className="h-3.5 w-3.5 text-forest-600" />
              {t('收付款与退款', 'Payments & refunds')}
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label={t('快捷操作', 'Quick actions')}>
            {QUICK_FILTERS.map((f) => {
              const Icon = f.icon;
              const active = value === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onChange(active ? null : f.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all',
                    active
                      ? 'border-forest-900 bg-forest-900 text-white shadow-sm'
                      : 'border-forest-900/15 bg-white text-forest-800 hover:border-forest-900/35 hover:bg-forest-50'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', active ? 'text-ice-200' : 'text-forest-600')} />
                  {lang === 'zh' ? f.label[0] : f.label[1]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}