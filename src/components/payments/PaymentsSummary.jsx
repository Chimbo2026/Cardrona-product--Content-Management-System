import { Clock, Landmark, RotateCcw, Wallet } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';

export default function PaymentsSummary({ summary }) {
  const { t } = useLang();

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('总收入', 'Total revenue')}
        value={NZD(summary.revenue)}
        sub={t('已收款预订', 'Collected from bookings')}
        icon={Wallet}
        tone="forest"
      />
      <StatCard
        label={t('待收款', 'Awaiting payment')}
        value={NZD(summary.awaiting)}
        sub={t('待结清余额', 'Open balances')}
        icon={Clock}
        tone="amber"
      />
      <StatCard
        label={t('已退还款', 'Refunds issued')}
        value={NZD(summary.refunded)}
        sub={t('已处理退款', 'Processed refunds')}
        icon={RotateCcw}
        tone="rose"
      />
      <StatCard
        label={t('结算净额', 'Settlements')}
        value={NZD(summary.settled)}
        sub={t('已收款减去退款', 'Collected less refunds')}
        icon={Landmark}
        tone="ice"
      />
    </div>
  );
}