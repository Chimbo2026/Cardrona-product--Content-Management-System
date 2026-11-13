import { useEffect, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import StatusBadge from '@/components/common/StatusBadge';
import { prettyDate } from '@/lib/format';
import { endTimeOf } from '@/lib/schedule';
import { syncLessonCounts } from '@/lib/lessonCapacity';
import { cn } from '@/lib/utils';

export default function LessonGuestsDialog({ open, onOpenChange, lesson, onChanged }) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guest, setGuest] = useState({ name: '', seats: 1 });
  const [error, setError] = useState('');

  const load = async () => {
    if (!lesson) return;
    setLoading(true);
    const res = await base44.entities.LessonBooking.filter({ lesson_id: lesson.id }, { limit: 200 });
    setBookings(res.items || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      setGuest({ name: '', seats: 1 });
      setError('');
      load();
    }
  }, [open, lesson?.id]);

  if (!lesson) return null;
  const cap = Number(lesson.capacity) || 0;
  const active = bookings.filter((b) => b.status !== 'Cancelled');
  const booked = active.reduce((s, b) => s + (Number(b.seats) || 1), 0);
  const remaining = Math.max(0, cap - booked);

  const addGuest = async () => {
    const seats = Math.max(1, Number(guest.seats) || 1);
    if (!guest.name.trim()) return setError('Enter the guest name');
    if (seats > remaining) return setError(`Only ${remaining} place${remaining === 1 ? '' : 's'} left on this lesson`);
    setError('');
    await base44.entities.LessonBooking.create({
      lesson_id: lesson.id,
      lesson_title: lesson.title,
      lesson_date: lesson.date,
      guest_name: guest.name.trim(),
      seats,
      instructor_name: lesson.instructor_name || '',
      status: 'Booked',
    });
    await syncLessonCounts(lesson.id);
    toast({ title: 'Guest registered', description: `${guest.name.trim()} · ${seats} place${seats === 1 ? '' : 's'}` });
    setGuest({ name: '', seats: 1 });
    await load();
    onChanged();
  };

  const cancelBooking = async (b) => {
    await base44.entities.LessonBooking.update(b.id, { status: 'Cancelled' });
    await syncLessonCounts(lesson.id);
    toast({ title: 'Seat released', description: `${b.guest_name} removed from ${lesson.title}` });
    await load();
    onChanged();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lesson guests</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2.5">
            <p className="text-[12.5px] font-semibold text-forest-900">{lesson.title}</p>
            <p className="text-[11.5px] text-muted-foreground">
              {prettyDate(lesson.date, 'EEE d MMM')} · {lesson.start_time}–{endTimeOf(lesson)} · {lesson.instructor_name || 'Unassigned'}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11.5px]">
              <span className="num font-semibold text-forest-900">{booked}/{cap} booked</span>
              <span className={cn('num font-medium', remaining === 0 ? 'text-amber-700' : 'text-ice-800')}>
                {remaining === 0 ? 'Lesson full' : `${remaining} places available`}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
              <div className={cn('h-full', remaining === 0 ? 'bg-amber-500' : 'bg-ice-500')} style={{ width: `${Math.min(100, (booked / Math.max(1, cap)) * 100)}%` }} />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <Field label="Add a guest" className="flex-1" error={error}>
              <Input value={guest.name} onChange={(e) => setGuest((g) => ({ ...g, name: e.target.value }))} placeholder="Guest full name" />
            </Field>
            <Field label="Places" className="w-24">
              <Input type="number" min={1} max={Math.max(1, remaining)} value={guest.seats} onChange={(e) => setGuest((g) => ({ ...g, seats: e.target.value }))} />
            </Field>
            <Button className="gap-1.5" onClick={addGuest} disabled={remaining === 0}>
              <UserPlus className="h-3.5 w-3.5" /> Register
            </Button>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Reservations ({active.length})
            </p>
            {loading && <p className="text-[12px] text-muted-foreground">Loading guests…</p>}
            {!loading && active.length === 0 && <p className="text-[12px] text-muted-foreground">No guests registered yet.</p>}
            <ul className="divide-y divide-border/60 rounded-lg border border-border/70">
              {active.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-forest-900">{b.guest_name}</p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {b.seats} place{b.seats === 1 ? '' : 's'}{b.booking_ref ? ` · ${b.booking_ref}` : ''} · {b.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-rose-600" onClick={() => cancelBooking(b)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}