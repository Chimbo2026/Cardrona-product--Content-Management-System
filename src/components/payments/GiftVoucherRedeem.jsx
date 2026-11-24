import { useState } from 'react';
import { Gift, Loader2, Undo2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';
import { bookingOutstanding, bookingTotalNzd } from '@/lib/payments';
import { voucherBalance, voucherUsable } from '@/lib/giftVouchers';

export default function GiftVoucherRedeem({ booking, onChanged }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const applied = Number(booking.voucher_amount) || 0;
  const paid = Number(booking.amount_paid) || 0;
  const total = bookingTotalNzd(booking);
  const outstanding = bookingOutstanding(booking);

  const apply = async () => {
    const value = code.trim().toUpperCase();
    if (!value || busy) return;
    if (outstanding <= 0) {
      setError(t('该预订已结清，无需使用礼券。', 'This booking is already settled.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await base44.entities.GiftVoucher.filter({ code: value }, { limit: 1 });
      const voucher = res?.items?.[0];
      if (!voucher) throw new Error(t('未找到该礼券，请核对券号。', 'No gift voucher found for that code.'));
      if (!voucherUsable(voucher)) {
        throw new Error(t('该礼券已失效或余额为零。', 'That voucher is expired or has no balance left.'));
      }

      const credit = Math.min(voucherBalance(voucher), outstanding);
      const remaining = voucherBalance(voucher) - credit;
      await base44.entities.GiftVoucher.update(voucher.id, {
        balance: remaining,
        status: remaining === 0 ? 'Redeemed' : 'Partially redeemed',
        redeemed_on_ref: booking.booking_ref,
      });

      const nextOutstanding = Math.max(0, outstanding - credit);
      const patch = {
        voucher_code: value,
        voucher_amount: applied + credit,
        payment_status: nextOutstanding === 0 ? 'Paid' : 'Partially Paid',
      };
      if (nextOutstanding === 0) patch.payment_method = 'Gift Voucher';
      await base44.entities.Booking.update(booking.id, patch);

      toast({
        title: t('礼券已使用', 'Gift voucher applied'),
        description: `${value} · ${NZD(credit)}`,
      });
      setCode('');
      onChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const release = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await base44.entities.GiftVoucher.filter({ code: booking.voucher_code }, { limit: 1 });
      const voucher = res?.items?.[0];
      if (voucher) {
        const restored = voucherBalance(voucher) + applied;
        await base44.entities.GiftVoucher.update(voucher.id, {
          balance: restored,
          status: restored >= (Number(voucher.amount) || restored) ? 'Active' : 'Partially redeemed',
          redeemed_on_ref: '',
        });
      }
      await base44.entities.Booking.update(booking.id, {
        voucher_code: '',
        voucher_amount: 0,
        payment_status: paid <= 0 ? 'Pending' : paid >= total ? 'Paid' : 'Partially Paid',
      });
      toast({ title: t('已移除礼券', 'Voucher removed'), description: booking.voucher_code });
      onChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-forest-900">
          <Gift className="h-3.5 w-3.5 text-primary" /> {t('礼券抵扣', 'Gift voucher')}
        </p>
        {applied > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {booking.voucher_code} · {NZD(applied)}
          </span>
        )}
      </div>

      {applied > 0 ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11.5px] text-muted-foreground">
            {t('礼券余额将保留，可用于其他预订。', 'Credit is held on this booking until you remove it.')}
          </p>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={release} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
            {t('移除礼券', 'Remove voucher')}
          </Button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('输入礼券号码，如 GV-482913', 'Enter voucher code, e.g. GV-482913')}
            className="h-9 max-w-[240px] font-mono text-[12.5px]"
          />
          <Button size="sm" onClick={apply} disabled={busy || !code.trim()}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('使用礼券', 'Apply voucher')}
          </Button>
        </div>
      )}

      {error && <p className="mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11.5px] font-medium text-rose-700">{error}</p>}
      {applied > 0 && outstanding <= 0 && (
        <p className="mt-2 text-[11px] text-emerald-700">
          {t('礼券已全额抵扣此预订。', 'The voucher covers this booking in full.')}
        </p>
      )}
    </div>
  );
}