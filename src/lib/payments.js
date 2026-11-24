import { convertFromNzd, currencyForCountry, WECHAT_CURRENCY } from '@/lib/currency';

const CARD_METHODS = ['visa', 'mastercard', 'card'];

// Booking total in NZD (amount is per seat).
export const bookingTotalNzd = (booking) =>
  (Number(booking?.amount) || 0) * (Number(booking?.guests_count) || 1);

// Credit already held against the booking: settled cash plus applied gift vouchers.
export const bookingCredit = (booking) =>
  (Number(booking?.voucher_amount) || 0) + (Number(booking?.amount_paid) || 0);

// What the guest still owes in NZD.
export const bookingOutstanding = (booking) =>
  Math.max(0, Math.round((bookingTotalNzd(booking) - bookingCredit(booking)) * 100) / 100);

// Collapses the many stored method values into the four badges shown on the payments table.
export const methodKind = (method) => {
  const value = String(method || '').toLowerCase();
  if (value.includes('wechat')) return 'wechat';
  if (CARD_METHODS.includes(value)) return 'card';
  if (value === 'alipay') return 'alipay';
  if (value === 'cash') return 'cash';
  if (value === 'account') return 'account';
  return 'unknown';
};

// Paid / Pending / Refunded, driven by the booking and any processed refund.
const transactionStatus = (booking, hasProcessedRefund) => {
  if (booking.payment_status === 'Refunded') return 'Refunded';
  if (booking.payment_status === 'Paid') return 'Paid';
  if (hasProcessedRefund) return 'Refunded';
  return 'Pending';
};

/**
 * Turns bookings (plus their Stripe payment and refund trail) into payment rows.
 * Bookings are the ledger: a processed refund flips the row to Refunded automatically.
 */
export function paymentRows({ bookings = [], payments = [], refunds = [] } = {}) {
  const gatewayByBooking = new Map();
  payments.forEach((p) => {
    if (!p.booking_id) return;
    const current = gatewayByBooking.get(p.booking_id);
    if (!current || (p.status === 'Paid' && current.status !== 'Paid')) {
      gatewayByBooking.set(p.booking_id, p);
    }
  });

  const refundedBookings = new Set(
    refunds.filter((r) => r.status === 'Processed').map((r) => r.booking_id)
  );

  return bookings
    .map((booking) => {
      const gateway = gatewayByBooking.get(booking.id);
      const status = transactionStatus(booking, refundedBookings.has(booking.id));
      const regionCurrency = currencyForCountry(booking.guest_country);
      const currency =
        gateway?.currency ||
        booking.currency ||
        (regionCurrency === WECHAT_CURRENCY ? 'NZD' : regionCurrency);
      const totalNzd = bookingTotalNzd(booking);

      return {
        id: booking.id,
        booking_ref: booking.booking_ref,
        guest_name: booking.guest_name,
        transaction_id:
          gateway?.payment_intent_id || gateway?.session_id || `TXN-${booking.booking_ref}`,
        amount: gateway ? Number(gateway.amount) || 0 : convertFromNzd(totalNzd, currency),
        amount_nzd: totalNzd,
        currency,
        method: methodKind(gateway?.method || booking.payment_method),
        status,
      };
    })
    .filter((row) => !(row.status === 'Pending' && row.amount_nzd === 0));
}

export function paymentSummary(rows = [], refunds = []) {
  const sum = (test) => rows.filter(test).reduce((total, row) => total + row.amount_nzd, 0);
  const revenue = sum((row) => row.status === 'Paid');
  const awaiting = sum((row) => row.status === 'Pending');
  const refunded = refunds
    .filter((refund) => refund.status === 'Processed')
    .reduce((total, refund) => total + (Number(refund.amount) || 0), 0);

  return { revenue, awaiting, refunded, settled: revenue - refunded };
}