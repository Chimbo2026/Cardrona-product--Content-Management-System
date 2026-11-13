import { cn } from '@/lib/utils';
import { FileCheck2, Ticket, PencilLine, RotateCcw, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export const BOOKING_STEPS = [
  { key: 'confirm', icon: FileCheck2, zh: '确认单', en: 'Confirmation' },
  { key: 'pay', icon: Wallet, zh: '付款与礼券', en: 'Payment & vouchers' },
  { key: 'collect', icon: Ticket, zh: '门票与取票', en: 'Tickets & collection' },
  { key: 'amend', icon: PencilLine, zh: '修改预订', en: 'Amend booking' },
  { key: 'refund', icon: RotateCcw, zh: '申请退款', en: 'Request refund' },
];

export default function BookingSteps({ value, onChange }) {
  const { t } = useLang();
  const index = BOOKING_STEPS.findIndex((s) => s.key === value);
  const prev = index > 0 ? BOOKING_STEPS[index - 1] : null;
  const next = index >= 0 && index < BOOKING_STEPS.length - 1 ? BOOKING_STEPS[index + 1] : null;

  return (
    <div className="space-y-3">
      <nav role="tablist" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {BOOKING_STEPS.map((step, i) => {
          const Icon = step.icon;
          const active = value === step.key;
          return (
            <button
              key={step.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(step.key)}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/80 bg-card text-forest-900 hover:border-primary/40 hover:bg-accent/40'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                  active ? 'bg-primary-foreground/20' : 'bg-forest-50 text-forest-700'
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{t(step.zh, step.en)}</span>
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'opacity-90' : 'text-muted-foreground')} />
            </button>
          );
        })}
      </nav>

      {(prev || next) && (
        <div className="flex items-center justify-between gap-3">
          {prev ? (
            <button
              type="button"
              onClick={() => onChange(prev.key)}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-forest-900"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> {t('上一步', 'Previous')} · {t(prev.zh, prev.en)}
            </button>
          ) : (
            <span />
          )}
          {next && (
            <button
              type="button"
              onClick={() => onChange(next.key)}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {t('下一步', 'Next')} · {t(next.zh, next.en)} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}