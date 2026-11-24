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
import { endTimeOf, toMin } from '@/lib/schedule';

const blank = (date) => ({
  title: '',
  lesson_category: 'Group',
  discipline: 'Ski',
  level: 'Beginner',
  age_group: 'Adult',
  date: date || todayISO(),
  start_time: '09:00',
  end_time: '11:00',
  instructor_id: '',
  capacity: 8,
  price: 129,
  meeting_point: 'Snow Sports School base',
  status: 'Scheduled',
  notes: '',
});

export default function LessonDialog({ open, onOpenChange, lesson, instructors, lessons, presetDate, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(blank(presetDate));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(lesson ? {
      ...blank(lesson.date),
      ...lesson,
      capacity: lesson.capacity ?? 8,
      price: lesson.price ?? 129,
    } : blank(presetDate));
  }, [open, lesson, presetDate]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const conflicts = useMemo(() => {
    if (!form.instructor_id) return [];
    return lessons.filter(
      (l) =>
        l.id !== lesson?.id &&
        l.instructor_id === form.instructor_id &&
        l.date === form.date &&
        l.status !== 'Cancelled' &&
        toMin(l.start_time) < toMin(form.end_time) &&
        toMin(form.start_time) < toMin(endTimeOf(l))
    );
  }, [lessons, form.instructor_id, form.date, form.start_time, form.end_time, lesson?.id]);

  const submit = async () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Lesson name is required';
    if (!form.date) next.date = 'Choose a date';
    if (!form.start_time || !form.end_time) next.end_time = 'Start and end time are required';
    else if (toMin(form.end_time) <= toMin(form.start_time)) next.end_time = 'End time must be after the start time';
    if (!form.capacity || Number(form.capacity) < 1) next.capacity = 'Capacity must be at least 1';
    if (lesson && Number(form.capacity) < Number(lesson.enrolled || 0)) {
      next.capacity = `Capacity cannot be below the ${lesson.enrolled} guests already booked`;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const instructor = instructors.find((i) => i.id === form.instructor_id);
      const payload = {
        title: form.title.trim(),
        lesson_category: form.lesson_category,
        lesson_type: form.lesson_category === 'Private' ? 'Private' : 'Group',
        discipline: form.discipline,
        level: form.level,
        age_group: form.lesson_category === 'Kids' ? 'Child' : form.age_group,
        instructor_id: form.instructor_id || '',
        instructor_name: instructor?.full_name || '',
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        duration_mins: toMin(form.end_time) - toMin(form.start_time),
        capacity: Number(form.capacity),
        price: Number(form.price) || 0,
        meeting_point: form.meeting_point,
        status: form.status,
        notes: form.notes || '',
      };
      if (lesson) await base44.entities.Lesson.update(lesson.id, payload);
      else await base44.entities.Lesson.create({ ...payload, enrolled: 0, attended: 0, attendance_marked: false });
      toast({
        title: lesson ? 'Lesson updated' : 'Lesson scheduled',
        description: `${payload.title} · ${payload.date} at ${payload.start_time}`,
      });
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({ title: 'Could not save lesson', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Edit lesson' : 'Schedule a lesson'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Lesson name" required error={errors.title} className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. First Tracks Group · Ski" />
          </Field>
          <Field label="Lesson type" required>
            <SelectNative value={form.lesson_category} onChange={set('lesson_category')} options={['Group', 'Private', 'Kids']} />
          </Field>
          <Field label="Discipline">
            <SelectNative value={form.discipline} onChange={set('discipline')} options={['Ski', 'Snowboard']} />
          </Field>
          <Field label="Skill level">
            <SelectNative value={form.level} onChange={set('level')} options={['First Timer', 'Beginner', 'Intermediate', 'Advanced', 'Expert']} />
          </Field>
          <Field label="Age group">
            <SelectNative
              value={form.lesson_category === 'Kids' ? 'Child' : form.age_group}
              onChange={set('age_group')}
              options={['Adult', 'Child']}
            />
          </Field>
          <Field label="Date" required error={errors.date}>
            <Input type="date" value={form.date} onChange={(e) => set('date')(e.target.value)} />
          </Field>
          <Field label="Instructor">
            <SelectNative
              value={form.instructor_id}
              onChange={set('instructor_id')}
              options={[{ value: '', label: 'Unassigned' }, ...instructors.map((i) => ({ value: i.id, label: `${i.full_name} · ${i.discipline}` }))]}
            />
          </Field>
          <Field label="Start time" required>
            <Input type="time" value={form.start_time} onChange={(e) => set('start_time')(e.target.value)} />
          </Field>
          <Field label="End time" required error={errors.end_time}>
            <Input type="time" value={form.end_time} onChange={(e) => set('end_time')(e.target.value)} />
          </Field>
          <Field label="Maximum capacity" required error={errors.capacity} hint={lesson ? `${lesson.enrolled || 0} guests currently booked` : 'Guests per session'}>
            <Input type="number" min={1} value={form.capacity} onChange={(e) => set('capacity')(e.target.value)} />
          </Field>
          <Field label="Price (NZD)">
            <Input type="number" min={0} value={form.price} onChange={(e) => set('price')(e.target.value)} />
          </Field>
          <Field label="Meeting point">
            <Input value={form.meeting_point} onChange={(e) => set('meeting_point')(e.target.value)} />
          </Field>
          <Field label="Status">
            <SelectNative value={form.status} onChange={set('status')} options={['Scheduled', 'In Progress', 'Completed', 'Cancelled']} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea rows={2} value={form.notes || ''} onChange={(e) => set('notes')(e.target.value)} placeholder="Anything the instructor should know" />
          </Field>
          {conflicts.length > 0 && (
            <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-900">
                <AlertTriangle className="h-3.5 w-3.5" /> Instructor already assigned
              </p>
              <p className="mt-0.5 text-[11.5px] text-amber-800">
                {conflicts[0].instructor_name || 'This instructor'} is teaching “{conflicts[0].title}” at {conflicts[0].start_time}–{endTimeOf(conflicts[0])}. You can still save, but the roster will show an overlap.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : lesson ? 'Save changes' : 'Schedule lesson'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}