import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';

const DEPARTMENTS = ['Lift Operations', 'Snowmaking', 'Snow School Instructors', 'Retail', 'Food & Beverage', 'First Aid', 'Guest Services', 'Rentals', 'Maintenance', 'Transport', 'Accommodation', 'Administration'];

const blank = () => ({
  staff_id: '',
  full_name: '',
  role: '',
  department: 'Lift Operations',
  email: '',
  phone: '',
  location: '',
  availability: 'Full time',
  certification: '',
  status: 'Off Duty',
  hourly_rate: 28,
});

export default function StaffDialog({ open, onOpenChange, onSaved, nextId }) {
  const { toast } = useToast();
  const [form, setForm] = useState(blank());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...blank(), staff_id: nextId });
      setErrors({});
    }
  }, [open, nextId]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = 'Staff name is required';
    if (!form.role.trim()) next.role = 'Add a job role';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await base44.entities.Staff.create({
        ...form,
        full_name: form.full_name.trim(),
        hourly_rate: Number(form.hourly_rate) || 0,
        start_date: new Date().toISOString().slice(0, 10),
        cert_expiry: '2027-06-30',
      });
      toast({ title: 'Staff member added', description: `${form.full_name} · ${form.department}` });
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({ title: 'Could not add staff', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add staff member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Staff ID" hint="Generated for this demo">
            <Input value={form.staff_id} onChange={(e) => set('staff_id')(e.target.value)} />
          </Field>
          <Field label="Full name" required error={errors.full_name}>
            <Input value={form.full_name} onChange={(e) => set('full_name')(e.target.value)} placeholder="e.g. Alex Tane" />
          </Field>
          <Field label="Job role" required error={errors.role}>
            <Input value={form.role} onChange={(e) => set('role')(e.target.value)} placeholder="e.g. Lift Operator" />
          </Field>
          <Field label="Department">
            <SelectNative value={form.department} onChange={set('department')} options={DEPARTMENTS} />
          </Field>
          <Field label="Shift availability">
            <SelectNative value={form.availability} onChange={set('availability')} options={['Full time', 'Part time', 'Casual', 'On call']} />
          </Field>
          <Field label="Status">
            <SelectNative value={form.status} onChange={set('status')} options={['On Duty', 'Off Duty', 'On Leave', 'Sick']} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set('phone')(e.target.value)} />
          </Field>
          <Field label="Base location">
            <Input value={form.location} onChange={(e) => set('location')(e.target.value)} placeholder="e.g. Base building" />
          </Field>
          <Field label="Certification">
            <Input value={form.certification} onChange={(e) => set('certification')(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Add staff member'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}