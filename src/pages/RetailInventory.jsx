import { useEffect, useMemo, useState } from 'react';
import { PackagePlus, ShoppingCart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import { SearchInput, SelectNative } from '@/components/common/Controls';
import InventoryStats from '@/components/retail/InventoryStats';
import InventoryTable from '@/components/retail/InventoryTable';
import BulkActionBar from '@/components/retail/BulkActionBar';
import BulkUpdateDialog from '@/components/retail/BulkUpdateDialog';
import ProductStockDialog from '@/components/retail/ProductStockDialog';
import RecordSaleDialog from '@/components/retail/RecordSaleDialog';
import SalesReport from '@/components/retail/SalesReport';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { salesTotals, stockState, withinDays } from '@/lib/retail';

export default function RetailInventory() {
  const { can } = useRole();
  const { t } = useLang();
  const canWrite = can('retail', 'write');

  const { items: products, loading, reload } = useList('RetailProduct', { active: true }, { sort: '-price', limit: 200 });
  const { items: sales, reload: reloadSales } = useList('RetailSale', {}, { sort: '-sold_at', limit: 500 });

  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All');
  const [lowOnly, setLowOnly] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selling, setSelling] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkMode, setBulkMode] = useState(null);

  // Live sales feed: a sale recorded anywhere refreshes the report immediately.
  useEffect(() => {
    const unsubscribe = base44.entities.RetailSale.subscribe(() => reloadSales());
    return unsubscribe;
  }, []);

  const brands = useMemo(() => [...new Set(products.map((p) => p.vendor).filter(Boolean))].sort(), [products]);
  const sales30 = useMemo(() => withinDays(sales, 30), [sales]);

  const soldById = useMemo(() => {
    const map = {};
    sales30.forEach((sale) => {
      const row = map[sale.product_id] || { units: 0, revenue: 0 };
      row.units += Number(sale.quantity) || 0;
      row.revenue += Number(sale.total) || 0;
      map[sale.product_id] = row;
    });
    return map;
  }, [sales30]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (brand !== 'All' && p.vendor !== brand) return false;
      if (lowOnly && ['In stock', 'Out of stock'].includes(stockState(p))) return false;
      if (!term) return true;
      return [p.name, p.vendor, p.category, p.sku].join(' ').toLowerCase().includes(term);
    });
  }, [products, search, brand, lowOnly]);

  const revenue30 = salesTotals(sales30).revenue;
  const selectedProducts = useMemo(() => products.filter((p) => selected.includes(p.id)), [products, selected]);
  const toggleSelected = (id) =>
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const toggleAll = () =>
    setSelected((ids) => (visible.every((p) => ids.includes(p.id)) ? [] : visible.map((p) => p.id)));

  return (
    <div>
      <PageHeader
        eyebrow={t('零售运营', 'Retail operations')}
        title={t('零售库存与定价', 'Retail inventory & pricing')}
        description={t('管理门店库存、调整新到货定价，并实时查看零售销售表现。', 'Manage shelf stock, set pricing on new arrivals and watch store sales in real time.')}
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5" onClick={() => setSelling({})}>
              <ShoppingCart className="h-3.5 w-3.5" /> {t('记录销售', 'Record sale')}
            </Button>
          ) : null
        }
      />

      <InventoryStats products={products} revenue={revenue30} />

      <Panel
        title={t('商品库存', 'Product stock')}
        description={t('点击“库存与定价”调整售价、成本与补货点。', 'Use “Stock & price” to update price, cost and reorder level.')}
        bodyClassName="p-0"
        className="mb-5"
        action={<span className="text-[11px] text-muted-foreground">{t(`${visible.length} 件商品`, `${visible.length} products`)}</span>}
      >
        <div className="flex flex-col gap-2 border-b border-border/70 p-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder={t('搜索商品、SKU 或品牌…', 'Search product, SKU or brand…')} className="sm:w-72" />
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <SelectNative ariaLabel={t('品牌', 'Brand')} value={brand} onChange={setBrand} includeAll allLabel={t('全部品牌', 'All brands')} options={brands} />
            <Button
              variant={lowOnly ? 'default' : 'outline'}
              size="sm"
              className="h-9 gap-1.5 text-[12px]"
              onClick={() => setLowOnly((v) => !v)}
            >
              <PackagePlus className="h-3.5 w-3.5" /> {t('仅看需补货', 'Needs reorder')}
            </Button>
          </div>
        </div>
        <BulkActionBar
          count={selectedProducts.length}
          onStock={() => setBulkMode('stock')}
          onPrice={() => setBulkMode('price')}
          onClear={() => setSelected([])}
        />
        <InventoryTable
          products={visible}
          loading={loading}
          canWrite={canWrite}
          soldById={soldById}
          selectedIds={selected}
          onToggle={toggleSelected}
          onToggleAll={toggleAll}
          onEdit={(p) => setEditing(p)}
          onSell={(p) => setSelling(p)}
        />
      </Panel>

      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-forest-950">{t('零售销售报告', 'Retail sales report')}</h2>
          <p className="text-[11.5px] text-muted-foreground">{t('数据随门店销售实时更新。', 'Updates live as sales are recorded at the store.')}</p>
        </div>
      </div>
      <SalesReport sales={sales} />

      {editing && (
        <ProductStockDialog
          product={editing}
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
          onSaved={reload}
        />
      )}

      {bulkMode && (
        <BulkUpdateDialog
          mode={bulkMode}
          products={selectedProducts}
          open={!!bulkMode}
          onOpenChange={(v) => !v && setBulkMode(null)}
          onSaved={() => {
            setSelected([]);
            reload();
          }}
        />
      )}

      {selling && (
        <RecordSaleDialog
          product={selling.id ? selling : null}
          products={products}
          open={!!selling}
          onOpenChange={(v) => !v && setSelling(null)}
          onSaved={() => {
            reload();
            reloadSales();
          }}
        />
      )}
    </div>
  );
}