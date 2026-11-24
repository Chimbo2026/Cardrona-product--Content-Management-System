import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import { todayISO } from '@/lib/format';
import { nextBookingRef } from '@/lib/bookingRef';
import { syncLessonCounts } from '@/lib/lessonCapacity';

const ACTIVITIES = ['Lift Pass', 'Lesson', 'Rental', 'Accommodation', 'Event', 'Transport', 'Food & Beverage', 'Gift Voucher'];

export default function BookingDialog({ open, onOpenChange, booking, lessons, agents = [], onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (booking) {
      setForm({ ...booking, guests_count: booking.guests_count ?? 1 });
    } else {
      setForm({
        booking_ref: '',
        visit_date: todayISO(),
        guest_name: '',
        email: '',
        phone: '',
        guests_count: 1,
        activity: 'Lift Pass',
        lesson_id: '',
        instructor_id: '',
        instructor_name: '',
        booking_status: 'Confirmed',
        payment_status: 'Pending',
        payment_method: 'Visa',
        amount: 0,
        channel: 'Phone',
        agent_id: '',
        agent_name: '',
        agent_discount: '',
        guest_dob: '',
        guest_country: '',
        pinyin_name: '',
        waiver_signed: false,
        notes: '',
      });
      nextBookingRef().then((ref) => setForm((f) => (f ? { ...f, booking_ref: ref } : f)));
    }
  }, [open, booking]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const lessonOptions = useMemo(
    () => (lessons || []).filter((l) => l.status !== 'Cancelled' && (!form?.visit_date || l.date === form.visit_date)),
    [lessons, form?.visit_date]
  );

  const pickLesson = (id) => {
    const l = (lessons || []).find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      lesson_id: id,
      lesson_title: l?.title || '',
      instructor_id: l?.instructor_id || '',
      instructor_name: l?.instructor_name || '',
      amount: f.activity === 'Lesson' && l ? Number(l.price) * (Number(f.guests_count) || 1) : f.amount,
    }));
  };

  if (!form) return null;

  const submit = async () => {
    const next = {};
    if (!form.guest_name.trim()) next.guest_name = 'Guest name is required';
    if (!form.visit_date) next.visit_date = 'Choose a visit date';
    if (!form.guests_count || Number(form.guests_count) < 1) next.guests_count = 'At least one guest';
    if (form.activity === 'Lesson' && form.lesson_id) {
      const lesson = lessons.find((l) => l.id === form.lesson_id);
      const already = booking?.lesson_id === form.lesson_id ? Number(booking.guests_count) || 0 : 0;
      const free = (Number(lesson?.capacity) || 0) - (Number(lesson?.enrolled) || 0) + already;
      if (Number(form.guests_count) > free) next.lesson_id = `Only ${Math.max(0, free)} place${free === 1 ? '' : 's'} left on this lesson`;
    }
    if (form.booking_ref) {
      const clash = await base44.entities.Booking.filter({ booking_ref: form.booking_ref }, { limit: 2 });
      const items = (clash.items || clash || []).filter((b) => b.id !== booking?.id);
      if (items.length) next.booking_ref = 'That booking reference is already in use';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const payload = {
        booking_ref: form.booking_ref,
        visit_date: form.visit_date,
        guest_name: form.guest_name.trim(),
        email: form.email || '',
        phone: form.phone || '',
        guests_count: Number(form.guests_count),
        activity: form.activity,
        lesson_id: form.activity === 'Lesson' ? form.lesson_id || '' : '',
        lesson_title: form.activity === 'Lesson' ? form.lesson_title || '' : '',
        instructor_id: form.activity === 'Lesson' ? form.instructor_id || '' : '',
        instructor_name: form.activity === 'Lesson' ? form.instructor_name || '' : '',
        booking_status: form.booking_status,
        payment_status: form.payment_status,
        amount: Number(form.amount) || 0,
        channel: form.channel || 'Phone',
        season: form.season || 'Winter',
        payment_method: form.payment_method || 'Visa',
        agent_id: form.channel === 'Agent' ? form.agent_id || '' : '',
        agent_name: form.channel === 'Agent' ? form.agent_name || '' : '',
        agent_discount: form.channel === 'Agent' ? Number(form.agent_discount) || 0 : 0,
        guest_dob: form.guest_dob || '',
        guest_country: form.guest_country || '',
        pinyin_name: form.pinyin_name || '',
        waiver_signed: !!form.waiver_signed,
        waiver_signed_at: form.waiver_signed ? (booking?.waiver_signed_at || new Date().toISOString()) : '',
        notes: form.notes || '',
      };

      const saved = booking
        ? await base44.entities.Booking.update(booking.id, payload)
        : await base44.entities.Booking.create(payload);
      const bookingId = booking?.id || saved?.id;

      // Keep Snow School capacity in step with the booking.
      if (booking?.lesson_id && (!payload.lesson_id || booking.lesson_id !== payload.lesson_id)) {
        await base44.entities.LessonBooking.updateMany(
          { booking_id: bookingId, status: 'Booked' },
          { $set: { status: 'Cancelled' } }
        );
        await syncLessonCounts(booking.lesson_id);
      }
      if (payload.lesson_id) {
        const existing = await base44.entities.LessonBooking.filter({ booking_id: bookingId, status: 'Booked' }, { limit: 10 });
        const rows = existing.items || existing || [];
        const row = rows.find((r) => r.lesson_id === payload.lesson_id);
        if (row) {
          await base44.entities.LessonBooking.update(row.id, { seats: payload.guests_count, guest_name: payload.guest_name });
        } else if (payload.booking_status !== 'Cancelled') {
          await base44.entities.LessonBooking.create({
            lesson_id: payload.lesson_id,
            lesson_title: payload.lesson_title,
            lesson_date: payload.visit_date,
            booking_id: bookingId,
            booking_ref: payload.booking_ref,
            guest_name: payload.guest_name,
            guest_email: payload.email,
            seats: payload.guests_count,
            instructor_name: payload.instructor_name,
            status: 'Booked',
          });
        }
        await syncLessonCounts(payload.lesson_id);
      }

      toast({
        title: booking ? 'Booking updated' : 'Booking created',
        description: `${payload.booking_ref} · ${payload.guest_name} · ${payload.visit_date}`,
      });
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({ title: 'Could not save booking', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? `Edit booking ${booking.booking_ref}` : 'New booking'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Booking reference" hint="Generated automatically, unique per booking">
            <Input value={form.booking_ref} onChange={(e) => set('booking_ref')(e.target.value)} error={undefined} />
            {errors.booking_ref && <p className="text-[11px] font-medium text-rose-600">{errors.booking_ref}</p>}
          </Field>
          <Field label="Visit date" required error={errors.visit_date}>
            <Input type="date" value={form.visit_date} onChange={(e) => set('visit_date')(e.target.value)} />
          </Field>
          <Field label="Guest full name" required error={errors.guest_name}>
            <Input value={form.guest_name} onChange={(e) => set('guest_name')(e.target.value)} placeholder="e.g. Aria Whitcombe" />
          </Field>
          <Field label="Number of guests" required error={errors.guests_count}>
            <Input type="number" min={1} value={form.guests_count} onChange={(e) => set('guests_count')(e.target.value)} />
          </Field>
          <Field label="Email (optional)">
            <Input type="email" value={form.email || ''} onChange={(e) => set('email')(e.target.value)} placeholder="guest@example.com" />
          </Field>
          <Field label="Phone (optional)">
            <Input value={form.phone || ''} onChange={(e) => set('phone')(e.target.value)} placeholder="+64 21 000 000" />
          </Field>
          <Field label="Booking category">
            <SelectNative value={form.activity} onChange={set('activity')} options={ACTIVITIES} />
          </Field>
          {form.activity === 'Lesson' && (
            <>
              <Field label="Lesson" error={errors.lesson_id} hint={`${lessonOptions.length} lessons on ${form.visit_date}`}>
                <SelectNative
                  value={form.lesson_id || ''}
                  onChange={pickLesson}
                  options={[{ value: '', label: 'Select a lesson' }, ...lessonOptions.map((l) => ({
                    value: l.id,
                    label: `${l.title} · ${l.start_time} · ${l.enrolled}/${l.capacity}`,
                  }))]}
                />
              </Field>
              <Field label="Assigned instructor" className="sm:col-span-2">
                <Input value={form.instructor_name || ''} onChange={(e) => set('instructor_name')(e.target.value)} placeholder="Auto-filled from the lesson" />
              </Field>
            </>
          )}
          <Field label="Booking status">
            <SelectNative value={form.booking_status} onChange={set('booking_status')} options={['Confirmed', 'Pending', 'Completed', 'Cancelled', 'No-show']} />
          </Field>
          <Field label="Payment status">
            <SelectNative value={form.payment_status} onChange={set('payment_status')} options={['Pending', 'Paid', 'Partially Paid', 'Refunded']} />
          </Field>
          <Field label="Amount (NZD)">
            <Input type="number" min={0} value={form.amount ?? 0} onChange={(e) => set('amount')(e.target.value)} />
          </Field>
          <Field label="Channel">
            <SelectNative value={form.channel || 'Phone'} onChange={set('channel')} options={['Online', 'Phone', 'Walk-in', 'Agent']} />
          </Field>
          {form.channel === 'Agent' && (
            <Field label="Selling agent" hint="Net-rate discount applies to the agent order">
              <SelectNative
                value={form.agent_id || ''}
                onChange={(id) => {
                  const a = agents.find((x) => x.id === id);
                  setForm((f) => ({ ...f, agent_id: id, agent_name: a?.company_name || '', agent_discount: a?.discount_rate || 0 }));
                }}
                options={[{ value: '', label: 'Select an agent' }, ...agents.map((a) => ({ value: a.id, label: `${a.company_name} · -${a.discount_rate}%` }))]}
              />
            </Field>
          )}
          <Field label="Payment method" hint="Refunds return to this method">
            <SelectNative value={form.payment_method || 'Visa'} onChange={set('payment_method')} options={['WeChat Pay', 'Visa', 'Mastercard', 'Alipay', 'Cash', 'Account']} />
          </Field>

          <div className="sm:col-span-2 mt-1 border-t border-border/70 pt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Guest identity &amp; waiver</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Date of birth">
                <Input type="date" value={form.guest_dob || ''} onChange={(e) => set('guest_dob')(e.target.value)} />
              </Field>
              <Field label="Country / region">
                <Input value={form.guest_country || ''} onChange={(e) => set('guest_country')(e.target.value)} placeholder="e.g. China" />
              </Field>
              <Field label="Name in Pinyin" hint="Must match the guest's passport" className="sm:col-span-2">
                <Input value={form.pinyin_name || ''} onChange={(e) => set('pinyin_name')(e.target.value)} placeholder="e.g. ZHANG WEI" />
              </Field>
              <label className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-[12px] text-forest-900 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={!!form.waiver_signed}
                  onChange={(e) => set('waiver_signed')(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
                />
                Digital waiver signed by the guest
              </label>
            </div>
          </div>

          <Field label="Notes" className="sm:col-span-2">
            <Textarea rows={2} value={form.notes || ''} onChange={(e) => set('notes')(e.target.value)} placeholder="Access requirements, rental requests, anything the team should know" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : booking ? 'Save changes' : 'Create booking'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}