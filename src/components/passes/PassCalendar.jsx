import { useState } from 'react';
import { addMonths, format } from 'date-fns';
import { Bike, ChevronLeft, ChevronRight, Plus, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Panel from '@/components/common/Panel';
import { daySummary, isLive, monthCells, productOf } from '@/lib/passCalendar';
import { prettyDate, todayISO } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

const WEEKDAYS = {
  zh: ['一', '二', '三', '四', '五', '六', '日'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

const FILTERS = [
  { value: 'All', zh: '全部', en: 'All' },
  { value: 'Lift Pass', zh: '缆车票', en: 'Lift passes' },
  { value: 'Bike Rental', zh: '单车租赁', en: 'Bike rental' },
];

export default function PassCalendar({ passes, canWrite, onSelectDay, onAddDays }) {
  const { t, lang } = useLang();
  const [month, setMonth] = useState(() => new Date());
  const [filter, setFilter] = useState('All');

  const visible = passes
    .filter(isLive)
    .filter((pass) => filter === 'All' || productOf(pass) === filter);

  const cells = monthCells(month);
  const inMonth = cells.filter((cell) => cell.inMonth);
  const liftDays = inMonth.filter((cell) => daySummary(visible, cell.key).lift > 0).length;
  const bikeDays = inMonth.filter((cell) => daySummary(visible, cell.key).bike > 0).length;
  const today = todayISO();

  return (
    <Panel
      title={t('预订日历', 'Booking calendar')}
      description={t(
        '显示本月已预订的缆车票与单车租赁日期。点击日期可改期或删除当天。',
        'Booked lift pass and bike rental days this month. Click a day to reschedule or release it.'
      )}
      action={
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label={t('上一月', 'Previous month')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[92px] text-center text-[12px] font-semibold text-forest-900">
            {prettyDate(format(month, 'yyyy-MM-01'), 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label={t('下一月', 'Next month')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {canWrite && (
            <Button size="sm" className="ml-1 gap-1.5" onClick={() => onAddDays(today)}>
              <Plus className="h-3.5 w-3.5" />
              {t('添加日期', 'Add days')}
            </Button>
          )}
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted/60 p-1">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors',
                filter === option.value ? 'bg-card text-forest-900 shadow-sm' : 'text-muted-foreground hover:text-forest-800'
              )}
            >
              {t(option.zh, option.en)}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-forest-100 text-forest-800">
              <Ticket className="h-2.5 w-2.5" />
            </span>
            {t(`缆车票 ${liftDays} 天`, `Lift ${liftDays} days`)}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-ice-100 text-ice-900">
              <Bike className="h-2.5 w-2.5" />
            </span>
            {t(`单车 ${bikeDays} 天`, `Bike ${bikeDays} days`)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS[lang === 'en' ? 'en' : 'zh'].map((label) => (
          <div key={label} className="pb-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </div>
        ))}

        {cells.map((cell) => {
          const summary = daySummary(visible, cell.key);
          const booked = summary.lift + summary.bike > 0;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDay(cell.key)}
              className={cn(
                'min-h-[74px] rounded-lg border p-1.5 text-left transition-colors',
                cell.inMonth ? 'border-border/70 bg-card hover:border-forest-300' : 'border-transparent bg-muted/20',
                booked && cell.inMonth && 'bg-forest-50/40',
                cell.key === today && 'ring-1 ring-forest-400'
              )}
            >
              <span className={cn('text-[11.5px] font-medium', cell.inMonth ? 'text-forest-900' : 'text-muted-foreground/50')}>
                {format(cell.date, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {summary.lift > 0 && (
                  <span className="flex items-center gap-1 rounded bg-forest-100 px-1 py-0.5 text-[10px] font-semibold text-forest-800">
                    <Ticket className="h-2.5 w-2.5" />
                    {summary.lift}
                  </span>
                )}
                {summary.bike > 0 && (
                  <span className="flex items-center gap-1 rounded bg-ice-100 px-1 py-0.5 text-[10px] font-semibold text-ice-900">
                    <Bike className="h-2.5 w-2.5" />
                    {summary.bike}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}