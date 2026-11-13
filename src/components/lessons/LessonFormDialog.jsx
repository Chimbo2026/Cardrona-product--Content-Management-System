import { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import { LESSON_LEVELS } from '@/lib/lessonUtils';

const toMinutes = (t = '00:00') => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export default function LessonFormDialog({ open, onOpenChange, lesson, instructors, lessons, onSaved }) {
  const { toast } = useToast();

  const fields = useMemo(
    () => [
      { name: 'title', label: 'Lesson title', required: true, colSpan: 2 },
      { name: 'discipline', label: 'Discipline', type: 'select', required: true, options: ['Ski', 'Snowboard'] },
      { name: 'lesson_type', label: 'Lesson type', type: 'select', required: true, options: ['Private', 'Group'] },
      { name: 'level', label: 'Ability level', type: 'select', required: true, options: LESSON_LEVELS },
      { name: 'age_group', label: 'Age group', type: 'select', required: true, options: ['Adult', 'Child'] },
      {
        name: 'instructor_id',
        label: 'Instructor',
        type: 'select',
        required: true,
        options: instructors.map((i) => ({ value: i.id, label: `${i.full_name} · ${i.discipline} · ${i.certification}` })),
      },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'start_time', label: 'Start time', type: 'time', required: true },
      { name: 'duration_mins', label: 'Duration (minutes)', type: 'number', defaultValue: 120 },
      { name: 'capacity', label: 'Maximum capacity', type: 'number', required: true },
      { name: 'enrolled', label: 'Guests enrolled', type: 'number' },
      { name: 'price', label: 'Price per guest (NZD)', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', required: true, options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'] },
      { name: 'meeting_point', label: 'Meeting point', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
    [instructors]
  );

  const validate = (values) => {
    const errors = {};
    const cap = Number(values.capacity) || 0;
    if (Number(values.enrolled) > cap) errors.enrolled = 'Enrolled cannot exceed capacity';
    const clash = lessons.find((l) => {
      if (l.id === lesson?.id) return false;
      if (l.instructor_id !== values.instructor_id) return false;
      if (l.date !== values.date) return false;
      if (l.status === 'Cancelled') return false;
      const aStart = toMinutes(l.start_time);
      const aEnd = aStart + (Number(l.duration_mins) || 120);
      const bStart = toMinutes(values.start_time);
      const bEnd = bStart + (Number(values.duration_mins) || 120);
      return bStart < aEnd && aStart < bEnd;
    });
    if (clash) errors.start_time = `This instructor already has "${clash.title}" at ${clash.start_time}`;
    return errors;
  };

  const submit = async (values) => {
    const inst = instructors.find((i) => i.id === values.instructor_id);
    const payload = {
      ...values,
      instructor_name: inst?.full_name || '',
      guest_names: lesson?.guest_names || [],
    };
    if (lesson) {
      await base44.entities.Lesson.update(lesson.id, payload);
      toast({ title: 'Lesson updated', description: `${values.title} · ${values.date}` });
    } else {
      await base44.entities.Lesson.create(payload);
      toast({ title: 'Lesson scheduled', description: `${values.title} · ${values.date} ${values.start_time}` });
    }
    onSaved?.();
  };

  return (
    <RecordFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={lesson ? `Edit ${lesson.title}` : 'Schedule a lesson'}
      description="Lessons are demonstration records. Overlapping instructor assignments are blocked."
      fields={fields}
      initialValues={
        lesson || {
          date: new Date().toISOString().slice(0, 10),
          start_time: '09:00',
          duration_mins: 120,
          capacity: 6,
          enrolled: 0,
          price: 129,
          lesson_type: 'Group',
          discipline: 'Ski',
          level: 'Beginner',
          age_group: 'Adult',
          status: 'Scheduled',
          meeting_point: 'Ski School Meeting Area — Base',
        }
      }
      onSubmit={submit}
      submitLabel={lesson ? 'Save lesson' : 'Schedule lesson'}
      validate={validate}
    />
  );
}