import { format, parseISO, isValid, startOfWeek, addDays } from 'date-fns';

export const toMin = (t) => {
  if (!t) return 0;
  const [h, m] = String(t).split(':').map(Number);
  return h * 60 + (m || 0);
};

export const addMinutes = (t, mins) => {
  const total = toMin(t) + Number(mins || 0);
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export const endTimeOf = (lesson) =>
  lesson?.end_time || addMinutes(lesson?.start_time || '09:00', Number(lesson?.duration_mins) || 120);

export const durationOf = (lesson) => Math.max(0, toMin(endTimeOf(lesson)) - toMin(lesson?.start_time));

export const overlaps = (a, b) => {
  if (!a || !b) return false;
  if (a.date !== b.date) return false;
  if (a.instructor_id && b.instructor_id && a.instructor_id !== b.instructor_id) return false;
  return toMin(a.start_time) < toMin(endTimeOf(b)) && toMin(b.start_time) < toMin(endTimeOf(a));
};

export const findConflicts = (lessons = []) => {
  const conflicts = [];
  const active = lessons.filter((l) => l.status !== 'Cancelled' && l.instructor_id);
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      if (overlaps(active[i], active[j])) conflicts.push({ a: active[i], b: active[j] });
    }
  }
  return conflicts;
};

export const isoOf = (d) => (d instanceof Date ? format(d, 'yyyy-MM-dd') : d);

export const weekDays = (anchor) => {
  const start = startOfWeek(anchor instanceof Date ? anchor : new Date(anchor), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const safeDate = (value) => {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
};