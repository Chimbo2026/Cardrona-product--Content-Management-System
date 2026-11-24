import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function StatCard({ label, value, sub, delta, icon: Icon, tone = 'forest', hint }) {
  const positive = Number(delta) >= 0;
  const bar = {
    forest: 'bg-forest-700',
    ice: 'bg-ice-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-[0_1px_2px_rgba(15,42,34,0.04)] transition hover:border-forest-200 hover:shadow-[0_6px_24px_-12px_rgba(15,42,34,0.25)]">
      <div className={cn('absolute inset-x-0 top-0 h-[2px] opacity-70', bar)} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span className="rounded-lg bg-forest-50 p-1.5 text-forest-700">
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        )}
      </div>
      <p className="num mt-2 text-[26px] font-semibold leading-none text-forest-950">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-[12px]">
        {delta !== undefined && delta !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium',
              positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(Number(delta)).toFixed(1)}%
          </span>
        )}
        {(sub || hint) && <span className="truncate text-muted-foreground">{sub || hint}</span>}
      </div>
    </div>
  );
}