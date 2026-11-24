import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export const productOf = (pass) => pass.product || 'Lift Pass';

export const dayKey = (date) => format(date, 'yyyy-MM-dd');

export const shiftDay = (iso, days) => format(addDays(parseISO(iso), days), 'yyyy-MM-dd');

export const dayCount = (from, to) =>
  Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86400000) + 1;

export const monthCells = (month) => {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map((date) => ({
    key: dayKey(date),
    date,
    inMonth: isSameMonth(date, month),
  }));
};

export const isLive = (pass) => pass.issue_status !== 'Cancelled';

export const passRange = (pass) => {
  const from = pass.valid_from || pass.valid_to;
  const to = pass.valid_to || pass.valid_from;
  return from && to ? { from, to } : null;
};

export const coversDay = (pass, key) => {
  const range = passRange(pass);
  return Boolean(range && range.from <= key && key <= range.to);
};

export const bookingsOnDay = (passes, key) =>
  passes.filter((pass) => isLive(pass) && coversDay(pass, key));

export const daySummary = (passes, key) =>
  bookingsOnDay(passes, key).reduce(
    (acc, pass) => {
      if (productOf(pass) === 'Bike Rental') acc.bike += 1;
      else acc.lift += 1;
      return acc;
    },
    { lift: 0, bike: 0 }
  );

/**
 * Works out how a single booked day is removed from a booking.
 * Returns { action: 'delete' } when the booking only covers that day,
 * { action: 'update', patch } when it shrinks the range, and
 * { action: 'split', patch, later } when the day sits inside a range.
 */
export const planDayRelease = (pass, key) => {
  const range = passRange(pass);
  if (!range) return { action: 'delete' };
  if (range.from === range.to) return { action: 'delete' };

  if (key === range.from) {
    const from = shiftDay(range.from, 1);
    return { action: 'update', patch: { valid_from: from, days_valid: dayCount(from, range.to) } };
  }
  if (key === range.to) {
    const to = shiftDay(range.to, -1);
    return { action: 'update', patch: { valid_to: to, days_valid: dayCount(range.from, to) } };
  }

  const before = shiftDay(key, -1);
  const after = shiftDay(key, 1);
  return {
    action: 'split',
    patch: { valid_to: before, days_valid: dayCount(range.from, before) },
    later: { valid_from: after, valid_to: range.to, days_valid: dayCount(after, range.to) },
  };
};