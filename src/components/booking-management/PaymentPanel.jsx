import { useState } from 'react';
import { CalendarClock, CreditCard, Gift, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Panel from '@/components/common/Panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import PaymentDialog from '@/components/payments/PaymentDialog';
import GiftVoucherDialog from '@/components/payments/GiftVoucherDialog';
import GiftVoucherRedeem from '@/components/payments/GiftVoucherRedeem';
import { useLang } from '@/lib/i18n';
import { NZD, prettyDate } from '@/lib/format';
import { bookingOutstanding, bookingTotalNzd } from '@/lib/payments';
import { cn } from '@/lib/utils';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function PaymentPanel({ booking, onChanged }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [payOpen, setPayOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [dueDate, setDueDate] = useState(booking.payment_due_date || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const total = bookingTotalNzd(booking);
  const paid = Number(booking.amount_paid) || 0;
  const voucher = Number(booking.voucher_amount) || 0;
  const outstanding = bookingOutstanding(booking);
  const terms = booking.payment_terms || 'Pay now';
  const overdue =
    terms === 'Pay later' && outstanding > 0 && Boolean(booking.payment_due_date) && booking.payment_due_date < todayISO();

  const saveTerms = async (next) => {
    setError('');
    if (next === 'Pay now') {
      setPayOpen(true);
      if (terms !== 'Pay now') {
        await base44.entities.Booking.update(booking.id, { payment_terms: 'Pay now', payment_due_date: '' });
        onChanged?.();
      }
      return;
    }
    if (!dueDate) {
      setError(t('请选择付款到期日。', 'Choose a payment due date.'));
      return;
    }
    setBusy(true);
    try {
      await base44.entities.Booking.update(booking.id, { payment_terms: 'Pay later', payment_due_date: dueDate });
      toast({
        title: t('已设为稍后支付', 'Pay later saved'),
        description: `${booking.booking_ref} · ${prettyDate(dueDate)}`,
      });
      onChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const totals = [
    [t('预订总额', 'Booking total'), NZD(total), ''],
    [t('礼券抵扣', 'Voucher applied'), NZD(voucher), ''],
    [t('已付款', 'Paid so far'), NZD(paid), ''],
    [t('尚需支付', 'Outstanding'), NZD(outstanding), 'text-primary'],
  ];

  return (
    <Panel
      title={t('付款与礼券', 'Payment & vouchers')}
      description={t('选择立即支付或稍后付款，并使用礼券抵扣。', 'Take payment now, invoice the guest to pay later, or redeem a gift voucher.')}
      action={
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setSellOpen(true)}>
          <Gift className="h-3.5 w-3.5" /> {t('售卖礼券', 'Sell gift voucher')}
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {totals.map(([label, value, tone]) => (
          <div key={label} className="rounded-lg border border-border/70 bg-muted/25 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">{label}</p>
            <p className={cn('num mt-0.5 text-[14px] font-semibold text-forest-950', tone)}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div
          className={cn(
            'rounded-xl border p-3',
            terms === 'Pay now' ? 'border-primary bg-primary/5' : 'border-border/80 bg-card'
          )}
        >
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-forest-900">
            <CreditCard className="h-3.5 w-3.5 text-primary" /> {t('立即支付', 'Pay now')}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {t('通过 Stripe 托管结账收取银行卡或微信支付款项。', 'Charge the balance by card or WeChat Pay through Stripe.')}
          </p>
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={() => saveTerms('Pay now')}
            disabled={outstanding <= 0}
          >
            {outstanding <= 0 ? t('已结清', 'Settled') : `${t('收款', 'Take payment')} · ${NZD(outstanding)}`}
          </Button>
        </div>

        <div
          className={cn(
            'rounded-xl border p-3',
            terms === 'Pay later' ? 'border-primary bg-primary/5' : 'border-border/80 bg-card'
          )}
        >
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-forest-900">
            <CalendarClock className="h-3.5 w-3.5 text-primary" /> {t('稍后支付', 'Pay later')}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {t('保留预订，在到期日前付款。', 'Hold the booking and settle before the due date.')}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 text-[12.5px]"
            />
            <Button size="sm" variant="outline" onClick={() => saveTerms('Pay later')} disabled={busy}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t('确认', 'Confirm')}
            </Button>
          </div>
          {booking.payment_terms === 'Pay later' && (
            <p className={cn('mt-2 text-[11px] font-medium', overdue ? 'text-rose-700' : 'text-muted-foreground')}>
              {t('到期日', 'Due')} · {prettyDate(booking.payment_due_date)}
              {overdue ? ` · ${t('已逾期', 'Overdue')}` : ''}
            </p>
          )}
        </div>
      </div>

      {error && <p className="mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11.5px] font-medium text-rose-700">{error}</p>}

      <div className="mt-3">
        <GiftVoucherRedeem booking={booking} onChanged={onChanged} />
      </div>

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        booking={booking}
        amountNzd={outstanding}
        onPaid={onChanged}
      />
      <GiftVoucherDialog open={sellOpen} onOpenChange={setSellOpen} onSaved={onChanged} />
    </Panel>
  );
}