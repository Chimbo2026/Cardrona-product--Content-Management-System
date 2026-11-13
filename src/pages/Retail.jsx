import { useMemo, useState } from 'react';
import { ArrowUpRight, Store } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { SearchInput, SelectNative } from '@/components/common/Controls';
import SportTabs from '@/components/common/SportTabs';
import RetailProductCard from '@/components/retail/RetailProductCard';
import useList from '@/hooks/useList';
import { useLang } from '@/lib/i18n';
import { NZD, num } from '@/lib/format';

const SHOP_URL = 'https://shop.cardrona.com/collections/shop-new-arrivals';

export default function Retail() {
  const { t } = useLang();
  const { items: products, loading } = useList('RetailProduct', { active: true }, { sort: '-price', limit: 200 });

  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All');
  const [brand, setBrand] = useState('All');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');

  const brands = useMemo(() => [...new Set(products.map((p) => p.vendor).filter(Boolean))].sort(), [products]);
  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(), [products]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = products.filter((p) => {
      const tags = p.tags || [];
      if (sport === 'Ski' && !tags.includes('Snow')) return false;
      if (sport === 'Bike' && !tags.includes('Bike')) return false;
      if (brand !== 'All' && p.vendor !== brand) return false;
      if (category !== 'All' && p.category !== category) return false;
      if (!term) return true;
      return [p.name, p.vendor, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(term);
    });
    if (sort === 'price_low') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_high') return [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, search, sport, brand, category, sort]);

  const lowestPrice = products.length ? Math.min(...products.map((p) => Number(p.price) || 0)) : 0;

  return (
    <div>
      <PageHeader
        eyebrow={t('零售商店', 'Retail store')}
        title={t('Cardrona Corner 新到货', 'Cardrona Corner new arrivals')}
        description={t('与 shop.cardrona.com 同步的零售新品目录，宾客可在官网直接购买。', 'Retail catalogue synced from shop.cardrona.com — guests complete their purchase on the official store.')}
        actions={
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12.5px] font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Store className="h-3.5 w-3.5" /> {t('打开官网商店', 'Open online store')} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t('在售商品', 'Products'), num(products.length)],
          [t('品牌', 'Brands'), num(brands.length)],
          [t('品类', 'Categories'), num(categories.length)],
          [t('起售价', 'From price'), NZD(lowestPrice)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder={t('搜索商品、品牌或品类…', 'Search product, brand or category…')} className="sm:w-72" />
        <SportTabs value={sport} onChange={setSport} />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <SelectNative ariaLabel={t('品牌', 'Brand')} value={brand} onChange={setBrand} includeAll allLabel={t('全部品牌', 'All brands')} options={brands} />
          <SelectNative ariaLabel={t('品类', 'Category')} value={category} onChange={setCategory} includeAll allLabel={t('全部品类', 'All categories')} options={categories} />
          <SelectNative
            ariaLabel={t('排序', 'Sort')}
            value={sort}
            onChange={setSort}
            options={[
              { value: 'featured', label: t('新品优先', 'New arrivals') },
              { value: 'price_low', label: t('价格从低到高', 'Price: low to high') },
              { value: 'price_high', label: t('价格从高到低', 'Price: high to low') },
              { value: 'name', label: t('名称 A-Z', 'Name A-Z') },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-[290px] animate-pulse rounded-xl border border-border/70 bg-muted/60" />
          ))}
        </div>
      ) : visible.length ? (
        <>
          <p className="mb-2 text-[11px] text-muted-foreground">{t(`显示 ${visible.length} 件商品`, `Showing ${visible.length} products`)}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {visible.map((product) => (
              <RetailProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Store}
          title={t('未找到商品', 'No products found')}
          description={t('调整搜索或筛选条件后再试。', 'Try a different search or filter.')}
        />
      )}

      <p className="mt-4 text-[11px] text-muted-foreground">
        {t('商品信息与图片来自 shop.cardrona.com，价格以官网为准。', 'Product details and imagery are sourced from shop.cardrona.com; the online store price is final.')}
      </p>
    </div>
  );
}