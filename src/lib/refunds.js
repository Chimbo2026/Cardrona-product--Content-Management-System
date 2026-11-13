import { base44 } from '@/api/base44Client';
import { syncLessonCounts } from '@/lib/lessonCapacity';

export const REFUND_REASONS = [
  'Weather or mountain closure',
  'Guest illness or injury',
  'Change of plans',
  'Duplicate or incorrect charge',
  'Service issue',
  'Agent cancellation',
  'Other',
];

export const REFUND_METHODS = ['WeChat Pay', 'Visa/Mastercard'];

// Why a provider or issuer can decline a refund credit, even after approval.
export const REFUND_FAILURE_REASONS = [
  'Refund window expired',
  'Transaction not settled',
  'Issuer declined',
  'Insufficient provider balance',
  'Provider error',
  'Other',
];

// Manual fallbacks offered once the provider refund cannot complete.
export const MANUAL_RESOLUTIONS = ['Store credit', 'Bank transfer', 'Guest to contact bank', 'No action'];

export const refundMethodForBooking = (booking) =>
  String(booking?.payment_method || '').toLowerCase().includes('wechat') ? 'WeChat Pay' : 'Visa/Mastercard';

export const nextRefundRef = async () => {
  const page = await base44.entities.RefundRequest.filter({}, { limit: 200, sort: '-created_date' });
  const rows = page?.items || page || [];
  const used = new Set(rows.map((r) => r.request_ref));
  let n = 1001;
  while (used.has(`RF-${n}`)) n += 1;
  return `RF-${n}`;
};

/**
 * Marks a pending refund as approved or rejected.
 */
export async function decideRefund(refund, decision, note, decidedBy) {
  return base44.entities.RefundRequest.update(refund.id, {
    status: decision,
    decision_note: note || '',
    decided_by: decidedBy || '',
    decided_at: new Date().toISOString(),
  });
}

/**
 * Processes an approved refund back to the original payment method.
 * - flips the booking to Refunded (full) or Partially Paid (partial)
 * - cancels the booking and releases Snow School seats on a full refund
 * - stamps who processed it, so finance reports and availability follow
 */
export async function processRefund(refund, booking, processedBy) {
  const amount = Number(refund.amount) || 0;
  const isFull = refund.refund_type === 'Full';

  await base44.entities.RefundRequest.update(refund.id, {
    status: 'Processed',
    processed_at: new Date().toISOString(),
    processed_by: processedBy || '',
  });

  if (booking) {
    const patch = { payment_status: isFull ? 'Refunded' : 'Partially Paid' };
    if (isFull) patch.booking_status = 'Cancelled';
    await base44.entities.Booking.update(booking.id, patch);

    if (isFull && booking.lesson_id) {
      await base44.entities.LessonBooking.updateMany(
        { booking_id: booking.id, status: 'Booked' },
        { $set: { status: 'Cancelled' } }
      );
      await syncLessonCounts(booking.lesson_id);
    }
  }

  if (!refund.released) {
    await base44.entities.RefundRequest.update(refund.id, { released: true });
  }

  return amount;
}

/**
 * Records a refund the provider or card issuer declined.
 * The booking is left untouched: the guest is still due the money.
 */
export async function failRefund(refund, reason, detail) {
  return base44.entities.RefundRequest.update(refund.id, {
    status: 'Failed',
    failure_reason: reason,
    failure_detail: detail || '',
    failed_at: new Date().toISOString(),
    stripe_refund_status: 'failed',
  });
}

/**
 * Moves a failed refund onto a manual path (store credit, bank transfer, …).
 */
export async function escalateToManual(refund, resolution, note, staff) {
  return base44.entities.RefundRequest.update(refund.id, {
    status: 'Manual required',
    resolution,
    resolution_note: note || '',
    resolved_by: staff || '',
  });
}

/**
 * Closes out a manual fallback once the alternative has been delivered.
 */
export async function resolveManualRefund(refund, note, staff) {
  const merged = [refund.resolution_note, note].filter(Boolean).join(' · ');
  const now = new Date().toISOString();
  return base44.entities.RefundRequest.update(refund.id, {
    status: 'Processed',
    resolution_note: merged,
    resolved_at: now,
    resolved_by: staff || refund.resolved_by || '',
    processed_at: now,
    processed_by: staff || '',
    released: true,
  });
}