export const LESSON_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const toMinutes = (t = '00:00') => {
  const [h, m] = String(t).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const endTime = (lesson) => {
  const total = toMinutes(lesson.start_time) + (Number(lesson.duration_mins) || 120);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const findConflicts = (lessons) => {
  const list = [];
  const active = lessons.filter((l) => l.status !== 'Cancelled');
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const a = active[i];
      const b = active[j];
      if (a.instructor_id !== b.instructor_id || a.date !== b.date) continue;
      const aS = toMinutes(a.start_time);
      const aE = aS + (Number(a.duration_mins) || 120);
      const bS = toMinutes(b.start_time);
      const bE = bS + (Number(b.duration_mins) || 120);
      if (bS < aE && aS < bE) list.push({ a, b });
    }
  }
  return list;
};

export const weekDays = (anchor) => {
  const start = new Date(anchor);
  const dow = (start.getDay() + 6) % 7; // Monday = 0
  start.setDate(start.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

export const isoOf = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};