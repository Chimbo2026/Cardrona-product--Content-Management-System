import { useState } from 'react';
import { CalendarDays, MapPin, Plus, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { NZD, num, prettyDate, todayISO } from '@/lib/format';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Mountain Biking', 'Mountain Carting', 'Sightseeing', 'Conference', 'Special Event', 'Winter Sport'];

export default function Events({ lockCategory = null, eyebrow = 'Seasonal programme', title = 'Events & summer activities', description = 'Mountain biking, carting, sightseeing, conferences and winter events with capacity and participation tracking.' }) {
  const { can } = useRole();
  const canWrite = can('events', 'write');
  const { toast } = useToast();
  const { items: events, loading, reload } = useList('Event', {}, { sort: 'date', limit: 200 });

  const [season, setSeason] = useState('All');
  const [category, setCategory] = useState('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [booking, setBooking] = useState(null);
  const [seats, setSeats] = useState(1);

  const filtered = events
    .filter((e) => (lockCategory ? e.category === lockCategory : true))
    .filter((e) => (season === 'All' ? true : e.season === season))
    .filter((e) => (lockCategory || category === 'All' ? true : e.category === category))
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = events.filter((e) => e.date >= todayISO() && e.status !== 'Cancelled');
  const booked = events.reduce((s, e) => s + (Number(e.booked) || 0), 0);
  const capacity = events.reduce((s, e) => s + (Number(e.capacity) || 0), 0);

  const fields = [
    { name: 'title', label: 'Activity title', required: true, colSpan: 2 },
    { name: 'category', label: 'Category', type: 'select', required: true, options: CATEGORIES },
    { name: 'season', label: 'Season', type: 'select', required: true, options: ['Winter', 'Summer'] },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'start_time', label: 'Start time', type: 'time' },
    { name: 'end_time', label: 'End time', type: 'time' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true },
    { name: 'booked', label: 'Booked', type: 'number' },
    { name: 'price', label: 'Price per guest (NZD)', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['Scheduled', 'Running', 'Completed', 'Cancelled'] },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ];

  const submit = async (values) => {
    if (Number(values.booked) > Number(values.capacity)) throw new Error('Bookings cannot exceed capacity.');
    if (editing) {
      await base44.entities.Event.update(editing.id, values);
      toast({ title: 'Activity updated', description: values.title });
    } else {
      await base44.entities.Event.create(values);
      toast({ title: 'Activity created', description: `${values.title} · ${prettyDate(values.date)}` });
    }
    reload();
  };

  const recordBookings = async () => {
    const next = Math.min(Number(booking.capacity), (Number(booking.booked) || 0) + Number(seats));
    await base44.entities.Event.update(booking.id, { booked: next, status: next >= booking.capacity ? 'Scheduled' : booking.status });
    toast({ title: 'Bookings recorded', description: `${booking.title} · ${next}/${booking.capacity} seats` });
    setBooking(null);
    reload();
  };

  const complete = async (e) => {
    await base44.entities.Event.update(e.id, { status: 'Completed', attended: e.booked || 0 });
    toast({ title: 'Activity completed', description: `${e.title} · ${e.booked} attended` });
    reload();
  };

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> New activity
            </Button>
          ) : null
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Upcoming activities', num(upcoming.length)],
          ['Seats booked', num(booked)],
          ['Capacity utilisation', `${capacity ? Math.round((booked / capacity) * 100) : 0}%`],
          ['Summer activities', num(events.filter((e) => e.season === 'Summer').length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-border bg-white p-1">
          {['All', 'Winter', 'Summer'].map((s) => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={cn('rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors', season === s ? 'bg-forest-800 text-white' : 'text-muted-foreground hover:text-forest-900')}
            >
              {s === 'All' ? 'All seasons' : s}
            </button>
          ))}
        </div>
        {!lockCategory && (
          <div className="ml-auto">
            <SelectNative ariaLabel="Category" value={category} onChange={setCategory} includeAll allLabel="All categories" options={CATEGORIES} />
          </div>
        )}
      </div>

      {loading && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-52 animate-pulse rounded-xl bg-forest-50" />)}</div>}

      {!loading && filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-[12.5px] text-muted-foreground">No activities match this filter.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((e) => {
          const pct = e.capacity ? (e.booked / e.capacity) * 100 : 0;
          const past = e.date < todayISO();
          return (
            <div key={e.id} className={cn('flex flex-col rounded-xl border bg-card p-4', past ? 'border-border/60' : 'border-border/80')}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ice-700">{e.category}</p>
                  <p className="mt-0.5 text-[13.5px] font-semibold leading-snug text-forest-900">{e.title}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {prettyDate(e.date, 'EEE d MMM')} · {e.start_time}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location || '—'}</span>
              </div>
              {e.description && <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">{e.description}</p>}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" /> {e.booked} / {e.capacity} booked</span>
                  <span className="num font-medium text-forest-900">{e.price ? NZD(e.price) : 'Free'}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-forest-50">
                  <div className={cn('h-full rounded-full', pct >= 95 ? 'bg-amber-500' : 'bg-forest-600')} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </div>
              {canWrite && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/70 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={e.booked >= e.capacity}
                    onClick={() => { setBooking(e); setSeats(1); }}
                  >
                    Record bookings
                  </Button>
                  {e.status !== 'Completed' && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={() => { setEditing(e); setOpen(true); }}>
                      Edit
                    </Button>
                  )}
                  {e.status !== 'Completed' && e.status !== 'Cancelled' && past && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-emerald-700" onClick={() => complete(e)}>
                      Mark completed
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <RecordFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? `Edit ${editing.title}` : 'New activity or event'}
        description="Demonstration activity records."
        fields={fields}
        initialValues={editing || { status: 'Scheduled', season: lockCategory ? 'Winter' : 'Summer', category: lockCategory || undefined, capacity: 24, booked: 0, price: 79, date: todayISO() }}
        onSubmit={submit}
        submitLabel={editing ? 'Save activity' : 'Create activity'}
      />

      <Dialog open={!!booking} onOpenChange={(v) => !v && setBooking(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record bookings</DialogTitle>
            <DialogDescription>{booking?.title} · {booking?.booked}/{booking?.capacity} already booked</DialogDescription>
          </DialogHeader>
          <Field label="Guests to add" required>
            <Input type="number" min={1} max={booking ? booking.capacity - booking.booked : 1} value={seats} onChange={(e) => setSeats(e.target.value)} />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBooking(null)}>Cancel</Button>
            <Button onClick={recordBookings}>Add bookings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}