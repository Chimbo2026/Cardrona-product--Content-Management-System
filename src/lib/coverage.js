import { toMin } from '@/lib/schedule';

/** Counts staff actually rostered against each department/shift target. */
export function computeCoverage(shifts = [], requirements = [], date) {
  return requirements
    .map((req) => {
      const scheduled = shifts.filter(
        (s) =>
          s.date === date &&
          s.department === req.department &&
          !['Cancelled', 'Absent'].includes(s.status) &&
          toMin(s.start_time) < toMin(req.end_time || '23:59') &&
          toMin(req.start_time || '00:00') < toMin(s.end_time)
      );
      const target = Number(req.min_staff) || 0;
      return {
        key: `${req.department}-${req.shift_label}`,
        department: req.department,
        shift_label: req.shift_label,
        window: `${req.start_time || '—'}–${req.end_time || '—'}`,
        scheduled: scheduled.length,
        target,
        ok: scheduled.length >= target,
        short: Math.max(0, target - scheduled.length),
        names: scheduled.map((s) => s.staff_name),
      };
    })
    .sort((a, b) => Number(a.ok) - Number(b.ok) || a.department.localeCompare(b.department));
}