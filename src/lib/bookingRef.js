import { base44 } from '@/api/base44Client';

/** Generates the next unused CRD-#### reference. */
export async function nextBookingRef() {
  const res = await base44.entities.Booking.filter({}, { limit: 500, sort: '-created_date' });
  const bookings = res.items || res || [];
  let max = 2400;
  bookings.forEach((b) => {
    const n = Number(String(b.booking_ref || '').replace(/\D/g, ''));
    if (!Number.isNaN(n) && n > max) max = n;
  });
  return `CRD-${max + 1}`;
}