import { Pencil, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import DataTable from '@/components/common/DataTable';
import StockBadge from '@/components/retail/StockBadge';
import { useLang } from '@/lib/i18n';
import { NZD, num } from '@/lib/format';

export default function InventoryTable({ products, loading, canWrite, soldById, onEdit, onSell, selectedIds = [], onToggle, onToggleAll }) {
  const { t } = useLang();
  const allSelected = products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  const selectColumn = {
    key: 'select',
    label: '',
    className: 'w-9',
    headerRender: () => (
      <input
        type="checkbox"
        aria-label={t('全选', 'Select all')}
        checked={allSelected}
        onChange={onToggleAll}
        className="h-3.5 w-3.5 cursor-pointer accent-forest-700"
      />
    ),
    render: (p) => (
      <input
        type="checkbox"
        aria-label={p.name}
        checked={selectedIds.includes(p.id)}
        onChange={() => onToggle(p.id)}
        onClick={(e) => e.stopPropagation()}
        className="h-3.5 w-3.5 cursor-pointer accent-forest-700"
      />
    ),
  };

  const columns = [
    ...(canWrite ? [selectColumn] : []),
    {
      key: 'name',
      label: t('商品', 'Product'),
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border/70 bg-muted/40">
            <Image src={p.image_url} alt={p.name} fittingType="fit" className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 font-medium text-forest-900">{p.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {p.vendor} · {p.sku || '—'}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: t('品类', 'Category'), render: (p) => <span className="text-[11.5px] text-muted-foreground">{p.category}</span> },
    { key: 'price', label: t('售价', 'Price'), align: 'right', render: (p) => <span className="num font-medium">{NZD(p.price)}</span> },
    {
      key: 'stock',
      label: t('库存 / 补货点', 'Stock / reorder'),
      align: 'right',
      render: (p) => (
        <span className="num text-[12px]">
          <span className="font-semibold text-forest-900">{num(p.stock_on_hand)}</span>
          <span className="text-muted-foreground"> / {num(p.reorder_level)}</span>
        </span>
      ),
    },
    { key: 'status', label: t('状态', 'Status'), render: (p) => <StockBadge product={p} /> },
    {
      key: 'sold',
      label: t('近 30 天售出', 'Sold 30d'),
      align: 'right',
      render: (p) => (
        <span className="num text-[12px] text-muted-foreground">
          {num(soldById[p.id]?.units || 0)} · {NZD(soldById[p.id]?.revenue || 0)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (p) =>
        canWrite ? (
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={(e) => { e.stopPropagation(); onEdit(p); }}>
              <Pencil className="h-3 w-3" /> {t('库存与定价', 'Stock & price')}
            </Button>
            <Button size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={(e) => { e.stopPropagation(); onSell(p); }}>
              <ShoppingCart className="h-3 w-3" /> {t('记录销售', 'Sell')}
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={products}
      loading={loading}
      emptyTitle={t('未找到商品', 'No products found')}
      emptyDescription={t('调整搜索或筛选条件后再试。', 'Adjust the search or filters and try again.')}
    />
  );
}