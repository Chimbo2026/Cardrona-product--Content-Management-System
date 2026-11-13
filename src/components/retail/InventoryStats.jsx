import { AlertTriangle, Boxes, CircleDollarSign, PackageX } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { NZD, num } from '@/lib/format';
import { stockValue } from '@/lib/retail';

export default function InventoryStats({ products, revenue }) {
  const { t } = useLang();
  const lowStock = products.filter((p) => Number(p.stock_on_hand) > 0 && Number(p.stock_on_hand) <= (Number(p.reorder_level) || 0));
  const outOfStock = products.filter((p) => !Number(p.stock_on_hand));

  const cards = [
    {
      label: t('在架件数', 'Units on shelf'),
      value: num(products.reduce((s, p) => s + (Number(p.stock_on_hand) || 0), 0)),
      icon: Boxes,
      tone: 'text-forest-800',
    },
    {
      label: t('库存零售价值', 'Stock value at retail'),
      value: NZD(stockValue(products)),
      icon: CircleDollarSign,
      tone: 'text-forest-800',
    },
    {
      label: t('库存偏低', 'Low stock'),
      value: num(lowStock.length),
      icon: AlertTriangle,
      tone: lowStock.length ? 'text-amber-600' : 'text-forest-800',
    },
    {
      label: t('缺货', 'Out of stock'),
      value: num(outOfStock.length),
      icon: PackageX,
      tone: outOfStock.length ? 'text-rose-600' : 'text-forest-800',
    },
    {
      label: t('近 30 天零售营收', '30-day store revenue'),
      value: NZD(revenue),
      icon: CircleDollarSign,
      tone: 'text-forest-800',
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
          </div>
          <p className={`num mt-1 text-[19px] font-semibold ${tone}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}