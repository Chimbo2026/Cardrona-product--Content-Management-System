import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prettyDate, todayISO } from '@/lib/format';
import { endTimeOf, isoOf, weekDays } from '@/lib/schedule';
import { cn } from '@/lib/utils';

const CAT = {
  Group: 'border-ice-200 bg-ice-50 text-ice-900',
  Private: 'border-violet-200 bg-violet-50 text-violet-900',
  Kids: 'border-amber-200 bg-amber-50 text-amber-900',
};

export default function LessonCalendar({ lessons, anchor, onAnchorChange, onSelectDay, onAddOnDay, canWrite }) {
  const days = weekDays(anchor);
  const today = todayISO();
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12.5px] font-medium text-forest-900">
          {prettyDate(isoOf(days[0]), 'd MMM')} – {prettyDate(isoOf(days[6]), 'd MMM yyyy')}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAnchorChange(new Date(anchor.getTime() - 7 * 86400000))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onAnchorChange(new Date())}>
            This week
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAnchorChange(new Date(anchor.getTime() + 7 * 86400000))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((d) => {
          const iso = isoOf(d);
          const items = lessons
            .filter((l) => l.date === iso)
            .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
          const isToday = iso === today;
          return (
            <div key={iso} className={cn('min-h-[150px] rounded-lg border p-2', isToday ? 'border-ice-300 bg-ice-50/40' : 'border-border/70 bg-white')}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{prettyDate(d, 'EEE')}</p>
                <p className={cn('num text-[12px] font-semibold', isToday ? 'text-ice-800' : 'text-forest-900')}>{prettyDate(d, 'd')}</p>
              </div>
              <div className="space-y-1">
                {items.length === 0 && <p className="py-2 text-center text-[10.5px] text-muted-foreground">No lessons</p>}
                {items.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onSelectDay(l.date)}
                    className={cn('w-full rounded-md border px-1.5 py-1 text-left transition hover:brightness-[0.98]', CAT[l.lesson_category] || CAT.Group)}
                  >
                    <p className="num text-[10px] font-semibold">{l.start_time}–{endTimeOf(l)}</p>
                    <p className="truncate text-[10.5px] font-medium leading-tight">{l.title}</p>
                    <p className="truncate text-[9.5px] opacity-75">{l.instructor_name || 'Unassigned'} · {l.enrolled}/{l.capacity}</p>
                  </button>
                ))}
                {canWrite && (
                  <button
                    onClick={() => onAddOnDay(iso)}
                    className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-1 text-[10px] text-muted-foreground transition hover:border-ice-300 hover:text-ice-800"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}