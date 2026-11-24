import { Link } from 'react-router-dom';
import { Gift, ArrowUpRight } from 'lucide-react';
import useList from '@/hooks/useList';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';

// Compact gift voucher snapshot on the dashboard, linking to the voucher hub.
export default function VoucherSnapshot() {
  const { t } = useLang();
  const { items } = useList('GiftVoucher', {}, { sort: '-created_date', limit: 200 });

  const sold = items.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const liability = items
    .filter((v) => v.status !== 'Expired')
    .reduce((sum, v) => sum + (Number(v.balance) || 0), 0);
  const active = items.filter((v) => v.status === 'Active').length;

  return (
    <Link
      to="/gift-vouchers"
      className="group mb-5 flex flex-col gap-3 rounded-xl border border-border/80 bg-gradient-to-r from-forest-50 via-card to-card px-4 py-3.5 transition hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <Gift className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-forest-900">{t('礼品卡', 'Gift Vouchers')}</p>
          <p className="text-[11.5px] text-muted-foreground">
            {t('购买礼品卡或输入兑换码抵扣订单', 'Buy a voucher or redeem a code against an order')}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5 sm:gap-7">
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t('销售', 'Sales')}</p>
          <p className="num text-[14px] font-semibold text-forest-950">{NZD(sold)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t('未兑付余额', 'Outstanding')}</p>
          <p className="num text-[14px] font-semibold text-amber-600">{NZD(liability)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t('未使用', 'Unused')}</p>
          <p className="num text-[14px] font-semibold text-forest-950">{active}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary group-hover:underline">
          {t('立即购买', 'Buy now')} <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}