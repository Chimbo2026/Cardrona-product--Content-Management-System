import { Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import { prettyDate } from '@/lib/format';
import { endTimeOf } from '@/lib/schedule';
import { cn } from '@/lib/utils';

const TONE = {
  Group: 'bg-ice-50 text-ice-800 ring-ice-600/20',
  Private: 'bg-violet-50 text-violet-700 ring-violet-600/15',
  Kids: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export default function LessonTable({ lessons, canWrite, conflictIds, onEdit, onGuests, onDelete }) {
  if (!lessons.length) {
    return (
      <EmptyState
        title="No lessons match these filters"
        description="Adjust the filters or schedule a new lesson for the Snow School."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border/80 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
            <th className="py-2.5 pr-3 font-semibold">Lesson</th>
            <th className="px-3 py-2.5 font-semibold">Type</th>
            <th className="px-3 py-2.5 font-semibold">Date &amp; time</th>
            <th className="px-3 py-2.5 font-semibold">Instructor</th>
            <th className="px-3 py-2.5 font-semibold">Level</th>
            <th className="px-3 py-2.5 font-semibold">Capacity</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            {canWrite && <th className="py-2.5 pl-3 text-right font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {lessons.map((l) => {
            const booked = Number(l.enrolled) || 0;
            const cap = Number(l.capacity) || 0;
            const full = booked >= cap;
            const conflict = conflictIds.has(l.id);
            return (
              <tr key={l.id} className={cn('border-b border-border/60 align-top', conflict && 'bg-amber-50/50')}>
                <td className="py-3 pr-3">
                  <p className="text-[12.5px] font-semibold text-forest-900">{l.title}</p>
                  <p className="text-[10.5px] text-muted-foreground">
                    {l.discipline} · {l.age_group || 'Adult'} {conflict && <span className="font-medium text-amber-700">· instructor overlap</span>}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-medium ring-1 ring-inset', TONE[l.lesson_category] || TONE.Group)}>
                    {l.lesson_category || l.lesson_type}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <p className="num text-[12px] font-medium text-forest-900">{prettyDate(l.date, 'EEE d MMM')}</p>
                  <p className="num text-[10.5px] text-muted-foreground">{l.start_time}–{endTimeOf(l)}</p>
                </td>
                <td className="px-3 py-3 text-[12px] text-forest-900">{l.instructor_name || <span className="text-rose-600">Unassigned</span>}</td>
                <td className="px-3 py-3 text-[12px] text-muted-foreground">{l.level}</td>
                <td className="px-3 py-3">
                  <p className={cn('num text-[12px] font-semibold', full ? 'text-amber-700' : 'text-forest-900')}>
                    {booked}/{cap}
                  </p>
                  <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-forest-50">
                    <div className={cn('h-full', full ? 'bg-amber-500' : 'bg-ice-500')} style={{ width: `${Math.min(100, (booked / Math.max(1, cap)) * 100)}%` }} />
                  </div>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={l.status} />
                  {full && l.status !== 'Cancelled' && <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Full</p>}
                </td>
                {canWrite && (
                  <td className="py-3 pl-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={() => onGuests(l)}>
                        <Users className="h-3 w-3" /> Guests
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={() => onEdit(l)}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] text-rose-600 hover:text-rose-700" onClick={() => onDelete(l)}>
                        <Trash2 className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}