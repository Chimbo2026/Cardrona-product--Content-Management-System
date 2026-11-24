import { ShoppingBag } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { paymentLabel, shippingLabel } from '@/lib/i18n/localize';
import { formatNZD } from '@/lib/shop';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
};

export default function RetailOrderCard({ order }) {
  const { lang, bi } = useLanguage();
  const items = order.items || [];
  const count = items.reduce((sum, line) => sum + Number(line.qty || 0), 0);
  const itemName = (line) => (lang === 'en' ? line.name_en || line.name_zh : line.name_zh);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ShoppingBag className="h-3 w-3" /> {bi('山地商店', 'Mountain store')}
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">{order.order_no}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 space-y-1">
        {items.map((line, index) => (
          <div key={`${line.item_id}-${index}`} className="flex justify-between gap-2 text-[11.5px]">
            <span className="line-clamp-1">
              {itemName(line)}
              {line.size ? ` · ${line.size}` : ''}
            </span>
            <span className="shrink-0 text-muted-foreground">×{line.qty}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {bi(`共 ${count} 件`, `${count} item${count === 1 ? '' : 's'}`)} ·{' '}
          {shippingLabel(order.shipping_method || '门店自提', lang)}
        </span>
        <span className="font-heading text-[15px] text-primary">
          {formatNZD(order.total_amount)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
        <span>{formatDate(order.created_date)}</span>
        <span>·</span>
        <span>{paymentLabel(order.payment_method, lang) || bi('在线支付', 'Paid online')}</span>
        {order.agent_rate ? (
          <>
            <span>·</span>
            <span className="text-emerald-700">
              {bi('代理折扣', 'Agent discount')} -{order.agent_rate}%
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}