// Gift voucher helpers shared by the voucher hub and the booking payment step.
import { base44 } from '@/api/base44Client';
import { bookingOutstanding } from '@/lib/payments';

export const giftVoucherCode = () => `GV-${Math.floor(100000 + Math.random() * 900000)}`;

export const voucherBalance = (voucher) => Math.max(0, Number(voucher?.balance) || 0);

export const voucherUsable = (voucher) =>
  Boolean(voucher) && voucher.status !== 'Expired' && voucher.status !== 'Redeemed' && voucherBalance(voucher) > 0;

// Preset face values offered on the purchase screen, in NZD.
export const VOUCHER_PRESETS = [200, 500, 1000];

export const nextYearISO = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

// Voucher status translated for display.
export const voucherStatusLabel = (status, lang) =>
  ({
    Active: lang === 'zh' ? '未使用' : 'Active',
    'Partially redeemed': lang === 'zh' ? '部分使用' : 'Partially redeemed',
    Redeemed: lang === 'zh' ? '已使用' : 'Redeemed',
    Expired: lang === 'zh' ? '已过期' : 'Expired',
  }[status] || status || '—');

/**
 * Sells a gift voucher: issues the code, records the sale as a paid booking and
 * returns the voucher so the caller can show the card and code.
 */
export async function sellGiftVoucher({
  purchaserName,
  email,
  recipientName,
  message,
  amount,
  currency = 'NZD',
  expiresAt,
  recipientChannel = 'WeChat',
  channel = 'Online',
  paymentMethod = 'WeChat Pay',
  agentName,
  soldBy,
}) {
  const code = giftVoucherCode();
  const bookingRef = `CRD-${3100 + Math.floor(Math.random() * 800)}`;
  const today = new Date().toISOString().slice(0, 10);
  const value = Number(amount) || 0;

  const voucher = await base44.entities.GiftVoucher.create({
    code,
    purchaser_name: purchaserName,
    guest_name: purchaserName,
    recipient_name: recipientName || purchaserName,
    email: email || '',
    recipient_channel: recipientChannel,
    message: message || '',
    amount: value,
    balance: value,
    currency,
    status: 'Active',
    expires_at: expiresAt || nextYearISO(),
    sold_on_ref: bookingRef,
    redeemed_on_ref: '',
    channel,
    agent_name: agentName || '',
    sold_by: soldBy || '',
  });

  await base44.entities.Booking.create({
    booking_ref: bookingRef,
    guest_name: purchaserName,
    email: email || '',
    visit_date: today,
    guests_count: 1,
    activity: 'Gift Voucher',
    amount: value,
    currency,
    payment_status: 'Paid',
    payment_method: paymentMethod,
    payment_terms: 'Pay now',
    amount_paid: value,
    booking_status: 'Completed',
    channel: channel === 'Agent' ? 'Agent' : channel === 'Front desk' ? 'Walk-in' : 'Online',
    agent_name: agentName || '',
    season: 'Winter',
    notes: `Gift voucher ${code} for ${recipientName || purchaserName}`,
  });

  return { code, bookingRef, voucher };
}

/**
 * Applies a voucher's remaining balance to a booking's outstanding balance.
 * Returns the credit that was applied, in NZD.
 */
export async function applyVoucherToBooking(voucher, booking) {
  const outstanding = bookingOutstanding(booking);
  if (outstanding <= 0) throw new Error('settled');
  if (!voucherUsable(voucher)) throw new Error('unusable');

  const credit = Math.min(voucherBalance(voucher), outstanding);
  if (credit <= 0) throw new Error('unusable');

  const remaining = voucherBalance(voucher) - credit;
  await base44.entities.GiftVoucher.update(voucher.id, {
    balance: remaining,
    status: remaining === 0 ? 'Redeemed' : 'Partially redeemed',
    redeemed_on_ref: booking.booking_ref,
  });

  const nextOutstanding = Math.max(0, outstanding - credit);
  const patch = {
    voucher_code: voucher.code,
    voucher_amount: (Number(booking.voucher_amount) || 0) + credit,
    payment_status: nextOutstanding === 0 ? 'Paid' : 'Partially Paid',
  };
  if (nextOutstanding === 0) patch.payment_method = 'Gift Voucher';
  await base44.entities.Booking.update(booking.id, patch);

  return credit;
}