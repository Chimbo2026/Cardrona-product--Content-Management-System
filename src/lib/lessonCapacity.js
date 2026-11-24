import { base44 } from '@/api/base44Client';

export const seatsOf = (bookings = []) =>
  bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (Number(b.seats) || 1), 0);

/** Recomputes a lesson's booked seats from its guest reservations. */
export async function syncLessonCounts(lessonId) {
  const res = await base44.entities.LessonBooking.filter({ lesson_id: lessonId }, { limit: 200 });
  const bookings = res.items || res || [];
  const active = bookings.filter((b) => b.status !== 'Cancelled');
  const enrolled = active.reduce((s, b) => s + (Number(b.seats) || 1), 0);
  await base44.entities.Lesson.update(lessonId, {
    enrolled,
    guest_names: active.map((b) => b.guest_name).slice(0, 20),
  });
  return enrolled;
}

export const remainingSeats = (lesson) =>
  Math.max(0, (Number(lesson?.capacity) || 0) - (Number(lesson?.enrolled) || 0));