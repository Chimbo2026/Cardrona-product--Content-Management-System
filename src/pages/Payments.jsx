import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import PaymentsSummary from '@/components/payments/PaymentsSummary';
import PaymentsTable from '@/components/payments/PaymentsTable';
import { paymentRows, paymentSummary } from '@/lib/payments';
import { useLang } from '@/lib/i18n';

export default function Payments() {
  const { t } = useLang();
  const [data, setData] = useState({ bookings: [], payments: [], refunds: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      base44.entities.Booking.filter({}, { sort: '-created_date', limit: 400 }),
      base44.entities.StripePayment.filter({}, { sort: '-created_date', limit: 400 }),
      base44.entities.RefundRequest.filter({}, { sort: '-created_date', limit: 400 }),
    ]).then(([bookings, payments, refunds]) => {
      if (!active) return;
      setData({
        bookings: bookings?.items || [],
        payments: payments?.items || [],
        refunds: refunds?.items || [],
      });
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => paymentRows(data), [data]);
  const summary = useMemo(() => paymentSummary(rows, data.refunds), [rows, data.refunds]);

  return (
    <div>
      <PageHeader
        eyebrow={t('宾客与销售', 'Guests & Sales')}
        title={t('收付款', 'Payments')}
        description={t(
          '所有渠道的收款、待收款与退款，汇总金额以新西兰元（NZD）计。',
          'Every payment, open balance and refund across all channels. Totals are shown in NZD.'
        )}
      />

      <div className="space-y-4">
        <PaymentsSummary summary={summary} />

        <Panel
          title={t('交易明细', 'Transactions')}
          description={t(
            'Stripe 银行卡与微信支付、前台现金及代理挂账均在此列出。',
            'Stripe card and WeChat Pay, front desk cash and agent accounts all appear here.'
          )}
          action={
            <span className="num rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {t(`${rows.length} 笔`, `${rows.length} rows`)}
            </span>
          }
          bodyClassName="p-0"
        >
          <PaymentsTable rows={rows} loading={loading} />
        </Panel>
      </div>
    </div>
  );
}