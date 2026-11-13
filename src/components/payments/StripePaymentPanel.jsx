import { useCallback, useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import PaymentDialog from '@/components/payments/PaymentDialog';
import { useLang } from '@/lib/i18n';
import { money } from '@/lib/currency';
import { prettyDateTime } from '@/lib/format';

export default function StripePaymentPanel({ booking, canWrite, onPaid }) {
  const { t } = useLang();
  const [payments, setPayments] = useState([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    base44.entities.StripePayment.filter({ booking_id: booking.id }, { sort: '-created_date', limit: 8 }).then(
      (res) => setPayments(res?.items || [])
    );
  }, [booking.id]);

  useEffect(() => {
    load();
  }, [load]);

  const settled = booking.payment_status === 'Paid' || booking.payment_status === 'Refunded';

  return (
    <Panel
      title={t('Stripe 收款', 'Stripe payment')}
      description={t('托管结账：银行卡与微信支付，支持 NZD / AUD / TWD / HKD', 'Hosted checkout: cards and WeChat Pay in NZD, AUD, TWD and HKD')}
      action={
        canWrite && (
          <Button size="sm" variant="outline" className="gap-1.5" disabled={settled} onClick={() => setOpen(true)}>
            <CreditCard className="h-3.5 w-3.5" />
            {t('收款', 'Take payment')}
          </Button>
        )
      }
    >
      {payments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted-foreground">
          {t('该预订尚无 Stripe 收款记录。', 'No Stripe payment attempts for this booking yet.')}
        </p>
      ) : (
        <ul className="divide-y divide-border/70">
          {payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="num text-[12.5px] font-medium text-forest-900">
                  {money(p.amount, p.currency)} · {t(p.method === 'WeChat Pay' ? '微信支付' : '银行卡', p.method)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {p.currency} · {prettyDateTime(p.paid_at || p.created_date)}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
        {t(
          'Stripe 测试模式：可使用测试卡 4242 4242 4242 4242（任意未来日期、任意 CVC）。',
          'Stripe test mode: use card 4242 4242 4242 4242 with any future expiry and any CVC.'
        )}
      </p>

      <PaymentDialog
        open={open}
        onOpenChange={setOpen}
        booking={booking}
        onPaid={() => {
          load();
          onPaid?.();
        }}
      />
    </Panel>
  );
}