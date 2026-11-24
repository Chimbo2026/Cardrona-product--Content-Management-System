import { Plus } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { prettyDate, todayISO } from '@/lib/format';
import { isoOf, weekDays } from '@/lib/schedule';
import { cn } from '@/lib/utils';

const BLOCK = {
  'Clocked In': 'border-emerald-200 bg-emerald-50 text-emerald-900',
  Late: 'border-amber-200 bg-amber-50 text-amber-900',
  Absent: 'border-rose-200 bg-rose-50 text-rose-900',
  Completed: 'border-border bg-muted/70 text-forest-800',
  Cancelled: 'border-border bg-muted/40 text-muted-foreground line-through',
  Scheduled: 'border-ice-200 bg-ice-50 text-forest-900',
};

export default function WeekGrid({ staff, shifts, anchor, onShiftClick, onAddShift, canWrite }) {
  const days = weekDays(anchor);
  const today = todayISO();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-[190px] border-b border-r border-border/70 bg-card px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Staff member
            </th>
            {days.map((d) => {
              const iso = isoOf(d);
              const isToday = iso === today;
              return (
                <th
                  key={iso}
                  className={cn(
                    'border-b border-border/70 px-2 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em]',
                    isToday ? 'bg-ice-50/70 text-ice-800' : 'text-muted-foreground'
                  )}
                >
                  {prettyDate(d, 'EEE')} <span className="num">{prettyDate(d, 'd')}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="align-top">
              <td className="sticky left-0 z-10 border-b border-r border-border/70 bg-card px-3 py-2">
                <p className="text-[12px] font-semibold text-forest-900">{s.full_name}</p>
                <p className="text-[10px] text-muted-foreground">{s.department}</p>
              </td>
              {days.map((d) => {
                const iso = isoOf(d);
                const cell = shifts.filter((x) => x.staff_id === s.staff_id && x.date === iso);
                return (
                  <td key={iso} className={cn('border-b border-border/70 px-1.5 py-1.5 align-top', iso === today && 'bg-ice-50/40')}>
                    <div className="space-y-1">
                      {cell.map((x) => (
                        <button
                          key={x.id}
                          onClick={() => canWrite && onShiftClick(x)}
                          className={cn('w-full rounded-md border px-1.5 py-1 text-left transition hover:brightness-[0.98]', BLOCK[x.status] || BLOCK.Scheduled)}
                        >
                          <p className="num text-[10px] font-semibold">{x.start_time}–{x.end_time}</p>
                          <p className="truncate text-[9.5px] font-medium">{x.department}</p>
                          <p className="truncate text-[9px] opacity-80">{x.status}{x.clock_in ? ` · in ${x.clock_in}` : ''}</p>
                        </button>
                      ))}
                      {cell.length === 0 && canWrite && (
                        <button
                          onClick={() => onAddShift(s.staff_id, iso)}
                          className="flex w-full items-center justify-center rounded-md border border-dashed border-border py-1.5 text-muted-foreground transition hover:border-ice-300 hover:text-ice-800"
                          aria-label={`Add shift for ${s.full_name} on ${iso}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 text-[10.5px] text-muted-foreground">
        {['Scheduled', 'Clocked In', 'Late', 'Absent', 'Completed'].map((s) => (
          <StatusBadge key={s} status={s} />
        ))}
      </div>
    </div>
  );
}