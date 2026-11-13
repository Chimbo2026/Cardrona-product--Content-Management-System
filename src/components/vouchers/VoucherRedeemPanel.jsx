import { useState } from 'react';
import { Loader2, Search, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectNative } from '@/components/common/Controls';
import { useToast } from '@/components/ui/use-toast';
import { useLang } from '@/lib/i18n';
import { NZD, prettyDate } from '@/lib/format';
import useList from '@/hooks/useList';
import VoucherCard from '@/components/vouchers/VoucherCard';
import { applyVoucherToBooking, voucherBalance, voucherUsable } from '@/lib/giftVouchers';
import { bookingOutstanding } from '@/lib/payments';

export default function VoucherRedeemPanel({ onRedeemed }) {
  const { t } = useLang();
  const { toast } = useToast();
  const { items: bookings } = useList(
    'Booking',
    { payment_status: { $in: ['Pending', 'Partially Paid'] } },
    { sort: '-visit_date', limit: 100 }
  );

  const [code, setCode] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [bookingId, setBookingId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(null);

  const openBookings = bookings.filter((b) => bookingOutstanding(b) > 0);

  const lookup = async (e) => {
    e?.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value || busy) return;
    setBusy(true);
    setError('');
    setApplied(null);
    setVoucher(null);
    setBookingId('');
    try {
      const res = await base44.entities.GiftVoucher.filter({ code: value }, { limit: 1 });
      const found = res?.items?.[0];
      if (!found) throw new Error(t('未找到该礼品卡，请核对兑换码。', 'No voucher found for that code.'));
      if (!voucherUsable(found)) {
        throw new Error(t('该礼品卡已失效或余额为零。', 'That voucher is expired or has no balance left.'));
      }
      setVoucher(found);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    const booking = openBookings.find((b) => b.id === bookingId);
    if (!booking || !voucher || busy) return;
    setBusy(true);
    setError('');
    try {
      const credit = await applyVoucherToBooking(voucher, booking);
      const res = await base44.entities.GiftVoucher.filter({ code: voucher.code }, { limit: 1 });
      const refreshed = res?.items?.[0];
      setVoucher(refreshed || { ...voucher, balance: voucherBalance(voucher) - credit });
      setApplied({ credit, booking });
      toast({
        title: t('礼品卡已使用', 'Voucher redeemed'),
        description: `${voucher.code} · ${NZD(credit)} · ${booking.booking_ref}`,
      });
      onRedeemed?.();
    } catch (err) {
      setError(
        err.message === 'settled'
          ? t('该预订已结清，无需使用礼品卡。', 'This booking is already settled.')
          : err.message === 'unusable'
          ? t('该礼品卡余额不足或已失效。', 'That voucher has no balance left or has expired.')
          : err.message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div className="rounded-xl border border-border/80 bg-card p-4">
        <p className="text-[13px] font-semibold text-forest-900">{t('输入兑换码', 'Enter voucher code')}</p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {t('礼品卡可用于抵扣缆车票、课程、租赁或住宿的未付余额。', 'Vouchers can pay the outstanding balance of lift passes, lessons, rentals or accommodation.')}
        </p>

        <form onSubmit={lookup} className="mt-3 flex flex-wrap items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('例如 GV-482913', 'e.g. GV-482913')}
            className="h-10 max-w-[260px] font-mono tracking-[0.1em]"
          />
          <Button type="submit" disabled={busy || !code.trim()} className="gap-1.5">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            {t('立即兑换', 'Redeem now')}
          </Button>
        </form>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11.5px] font-medium text-rose-700">{error}</p>
        )}

        {voucher && (
          <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="num font-mono text-[13px] font-semibold text-forest-900">{voucher.code}</p>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {t('余额', 'Balance')} {NZD(voucherBalance(voucher))}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {t('有效期至', 'Valid until')} {prettyDate(voucher.expires_at)}
              {voucher.recipient_name ? ` · ${t('接收人', 'To')} ${voucher.recipient_name}` : ''}
            </p>

            {applied && (
              <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11.5px] font-medium text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t(
                  `已抵扣 ${NZD(applied.credit)}，用于预订 ${applied.booking.booking_ref}`,
                  `${NZD(applied.credit)} applied to booking ${applied.booking.booking_ref}`
                )}
              </p>
            )}

            {voucherBalance(voucher) > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SelectNative
                  ariaLabel={t('选择预订', 'Choose booking')}
                  value={bookingId}
                  onChange={setBookingId}
                  options={[{ value: '', label: t('选择未结清的预订', 'Choose an open booking') }].concat(openBookings.map((b) => ({
                    value: b.id,
                    label: `${b.booking_ref} · ${b.guest_name} · ${NZD(bookingOutstanding(b))} ${t('未付', 'due')}`,
                  })))}
                />
                <Button size="sm" onClick={apply} disabled={busy || !bookingId}>
                  {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {t('抵扣余额', 'Apply credit')}
                </Button>
              </div>
            )}
            {voucherBalance(voucher) <= 0 && (
              <p className="mt-2 text-[11.5px] font-medium text-rose-700">
                {t('该礼品卡余额已用尽。', 'This voucher has no balance left.')}
              </p>
            )}
          </div>
        )}
      </div>

      {voucher ? (
        <VoucherCard voucher={voucher} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <Search className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-[12px] text-muted-foreground">
            {t('兑换后将显示礼品卡卡面与剩余余额。', 'Enter a code to see the voucher card and its remaining balance.')}
          </p>
        </div>
      )}
    </div>
  );
}