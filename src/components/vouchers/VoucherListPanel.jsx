import { useState } from 'react';
import { Gift } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import useList from '@/hooks/useList';
import { useLang } from '@/lib/i18n';
import { NZD, prettyDate } from '@/lib/format';

const FILTERS = [
  { key: 'all', zh: '全部', en: 'All' },
  { key: 'Active', zh: '未使用', en: 'Active' },
  { key: 'Partially redeemed', zh: '部分使用', en: 'Partially redeemed' },
  { key: 'Redeemed', zh: '已使用', en: 'Redeemed' },
  { key: 'Expired', zh: '已过期', en: 'Expired' },
];

export default function VoucherListPanel({ refreshKey = 0 }) {
  const { t } = useLang();
  const [filter, setFilter] = useState('all');
  const { items, loading } = useList('GiftVoucher', {}, { sort: '-created_date', limit: 200 });

  const vouchers = filter === 'all' ? items : items.filter((v) => v.status === filter);
  const sold = items.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const liability = items
    .filter((v) => v.status !== 'Expired')
    .reduce((sum, v) => sum + (Number(v.balance) || 0), 0);
  const redeemed = sold - liability;

  return (
    <div key={refreshKey}>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-card p-3.5">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{t('礼品卡销售', 'Voucher sales')}</p>
          <p className="num mt-1 text-[20px] font-semibold text-forest-950">{NZD(sold)}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-3.5">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{t('未兑付余额（负债）', 'Outstanding liability')}</p>
          <p className="num mt-1 text-[20px] font-semibold text-amber-600">{NZD(liability)}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-3.5">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{t('已兑付金额', 'Redeemed')}</p>
          <p className="num mt-1 text-[20px] font-semibold text-emerald-600">{NZD(redeemed)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition ${
              filter === f.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-white text-muted-foreground hover:border-primary/40'
            }`}
          >
            {t(f.zh, f.en)}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-border/80 bg-card">
        {loading ? (
          <p className="p-6 text-center text-[12px] text-muted-foreground">{t('正在加载礼品卡…', 'Loading vouchers…')}</p>
        ) : vouchers.length === 0 ? (
          <EmptyState
            icon={Gift}
            title={t('暂无礼品卡', 'No gift vouchers yet')}
            description={t('售出的礼品卡会显示在这里，含余额与兑付状态。', 'Sold vouchers appear here with their balance and redemption status.')}
          />
        ) : (
          <table className="w-full text-[12px]">
            <thead className="bg-muted/50 text-left text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2">{t('兑换码', 'Code')}</th>
                <th className="px-3 py-2">{t('接收人', 'Recipient')}</th>
                <th className="px-3 py-2 text-right">{t('面值', 'Amount')}</th>
                <th className="px-3 py-2 text-right">{t('余额', 'Balance')}</th>
                <th className="px-3 py-2">{t('状态', 'Status')}</th>
                <th className="px-3 py-2">{t('有效期至', 'Valid until')}</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="border-t border-border/60">
                  <td className="num px-3 py-2 font-mono font-medium text-forest-900">{v.code}</td>
                  <td className="px-3 py-2 text-forest-900">{v.recipient_name || v.purchaser_name || v.guest_name || '—'}</td>
                  <td className="num px-3 py-2 text-right">{NZD(Number(v.amount) || 0)}</td>
                  <td className="num px-3 py-2 text-right font-medium">{NZD(Number(v.balance) || 0)}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{v.expires_at ? prettyDate(v.expires_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}