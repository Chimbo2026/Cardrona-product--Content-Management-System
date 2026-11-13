import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import { todayISO } from '@/lib/format';
import { toMin } from '@/lib/schedule';

const blank = (date, staff) => ({
  staff_id: staff?.staff_id || '',
  staff_name: staff?.full_name || '',
  department: staff?.department || 'Lift Operations',
  role: staff?.role || '',
  date: date || todayISO(),
  start_time: '07:30',
  end_time: '16:00',
  location: staff?.location || '',
  status: 'Scheduled',
  notes: '',
});

export default function ShiftDialog({ open, onOpenChange, shift, staff, shifts, defaultDate, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(blank(defaultDate));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(shift ? { ...blank(shift.date), ...shift } : blank(defaultDate));
  }, [open, shift, defaultDate]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const pickStaff = (id) => {
    const s = staff.find((x) => x.staff_id === id) || staff.find((x) => x.id === id);
    setForm((f) => ({ ...f, staff_id: s?.staff_id || id, staff_name: s?.full_name || '', department: s?.department || f.department, role: s?.role || f.role, location: s?.location || f.location }));
  };

  const clash = useMemo(() => {
    if (!form.staff_id) return null;
    return shifts.find(
      (s) =>
        s.id !== shift?.id &&
        s.staff_id === form.staff_id &&
        s.date === form.date &&
        s.status !== 'Cancelled' &&
        toMin(s.start_time) < toMin(form.end_time) &&
        toMin(form.start_time) < toMin(s.end_time)
    );
  }, [shifts, form.staff_id, form.date, form.start_time, form.end_time, shift?.id]);

  const save = async () => {
    if (!form.staff_id) return setError('Choose a staff member for this shift');
    if (!form.date) return setError('Choose a shift date');
    if (toMin(form.end_time) <= toMin(form.start_time)) return setError('End time must be after the start time');
    setError('');
    setSaving(true);
    const hours = Math.round(((toMin(form.end_time) - toMin(form.start_time)) / 60) * 10) / 10;
    const label = toMin(form.start_time) < 660 ? 'Morning' : toMin(form.start_time) < 960 ? 'Afternoon' : 'Evening';
    const payload = {
      staff_id: form.staff_id,
      staff_name: form.staff_name,
      department: form.department,
      role: form.role,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      hours,
      location: form.location,
      status: form.status,
      shift_label: label,
      notes: form.notes || '',
    };
    try {
      if (shift) await base44.entities.Shift.update(shift.id, payload);
      else await base44.entities.Shift.create(payload);
      toast({ title: shift ? 'Shift updated' : 'Shift added', description: `${payload.staff_name} · ${payload.date} ${payload.start_time}–${payload.end_time}` });
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({ title: 'Could not save shift', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const clock = async (action) => {
    const time = new Date().toTimeString().slice(0, 5);
    if (action === 'in') {
      await base44.entities.Shift.update(shift.id, { status: 'Clocked In', clock_in: time });
      await base44.entities.AttendanceRecord.create({
        staff_id: shift.staff_id, staff_name: shift.staff_name, shift_id: shift.id,
        department: shift.department, date: shift.date, clock_in: time, status: 'Clocked In',
      });
      toast({ title: 'Clocked in', description: `${shift.staff_name} · ${time}` });
    } else {
      await base44.entities.Shift.update(shift.id, { status: 'Completed', clock_out: time });
      await base44.entities.AttendanceRecord.create({
        staff_id: shift.staff_id, staff_name: shift.staff_name, shift_id: shift.id,
        department: shift.department, date: shift.date, clock_in: shift.clock_in || shift.start_time,
        clock_out: time, status: 'Completed',
      });
      toast({ title: 'Clocked out', description: `${shift.staff_name} · ${time}` });
    }
    onOpenChange(false);
    onSaved();
  };

  const cancelShift = async () => {
    await base44.entities.Shift.update(shift.id, { status: 'Cancelled' });
    toast({ title: 'Shift cancelled', description: `${shift.staff_name} · ${shift.date}` });
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{shift ? 'Edit shift' : 'Add shift'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Staff member" required error={error} className="sm:col-span-2">
            <SelectNative
              value={form.staff_id}
              onChange={pickStaff}
              options={[{ value: '', label: 'Select staff' }, ...staff.map((s) => ({ value: s.staff_id, label: `${s.full_name} · ${s.department}` }))]}
            />
          </Field>
          <Field label="Department">
            <Input value={form.department} onChange={(e) => set('department')(e.target.value)} />
          </Field>
          <Field label="Role">
            <Input value={form.role} onChange={(e) => set('role')(e.target.value)} />
          </Field>
          <Field label="Date" required>
            <Input type="date" value={form.date} onChange={(e) => set('date')(e.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={form.location || ''} onChange={(e) => set('location')(e.target.value)} />
          </Field>
          <Field label="Start time" required>
            <Input type="time" value={form.start_time} onChange={(e) => set('start_time')(e.target.value)} />
          </Field>
          <Field label="End time" required>
            <Input type="time" value={form.end_time} onChange={(e) => set('end_time')(e.target.value)} />
          </Field>
          <Field label="Status">
            <SelectNative value={form.status} onChange={set('status')} options={['Scheduled', 'Clocked In', 'Late', 'Completed', 'Absent']} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea rows={2} value={form.notes || ''} onChange={(e) => set('notes')(e.target.value)} />
          </Field>
          {clash && (
            <div className="sm:col-span-2 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {form.staff_name} already has a shift {clash.start_time}–{clash.end_time} on this date.
            </div>
          )}
        </div>
        <DialogFooter className="flex-wrap gap-2">
          {shift && !['Cancelled', 'Completed'].includes(shift.status) && (
            <div className="mr-auto flex gap-2">
              {shift.status !== 'Clocked In' && shift.status !== 'Late' && (
                <Button variant="outline" size="sm" onClick={() => clock('in')}>Clock in now</Button>
              )}
              {(shift.status === 'Clocked In' || shift.status === 'Late') && (
                <Button variant="outline" size="sm" onClick={() => clock('out')}>Clock out now</Button>
              )}
              <Button variant="ghost" size="sm" className="text-rose-600" onClick={cancelShift}>Cancel shift</Button>
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : shift ? 'Save shift' : 'Add shift'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}