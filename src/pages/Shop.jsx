import { useEffect, useState } from 'react';
import { BadgePercent, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import { useCart } from '@/lib/CartContext';
import ShopCard from '@/components/shop/ShopCard';
import ShopCart from '@/components/shop/ShopCart';
import ShopCheckout from '@/components/shop/ShopCheckout';
import { SHOP_FILTERS } from '@/lib/shop';
import { useAgent } from '@/lib/AgentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Shop() {
  const { lang, t, bi } = useLanguage();
  const { agent } = useAgent();
  const { count } = useCart();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');
  const [brand, setBrand] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () => base44.entities.ShopItem.filter({ status: 'active' }, { sort: 'sort_order', limit: 50 }),
      { items: [] },
    )
      .then((page) => {
        if (active) setItems(page.items || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeFilter = SHOP_FILTERS.find((item) => item.key === filter) || SHOP_FILTERS[0];
  const brands = Array.from(new Set(items.map((item) => item.brand).filter(Boolean)));
  const visible = items.filter((item) => {
    if (brand && item.brand !== brand) return false;
    if (activeFilter.onlyNew) return item.is_new;
    return activeFilter.category ? item.category === activeFilter.category : true;
  });

  return (
    <div className="flex min-h-full flex-col pb-4">
      {agent && (
        <div className="mx-4 mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-medium text-emerald-800">
          <BadgePercent className="h-3.5 w-3.5" />
          {t('home.agentBadge', { rate: agent.rate })}
        </div>
      )}

      <div className="sticky top-0 z-10 space-y-1.5 bg-background/90 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5 overflow-x-auto scrollbar-none">
          {SHOP_FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px] transition ${
                filter === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={t('shop.cart')}
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground/75"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        </div>

        {brands.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setBrand('')}
              className={`shrink-0 rounded-full border px-3 py-1 text-[10.5px] transition ${
                brand === '' ? 'border-primary text-primary' : 'border-border text-muted-foreground'
              }`}
            >
              {bi('全部品牌', 'All brands')}
            </button>
            {brands.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setBrand(brand === item ? '' : item)}
                className={`shrink-0 rounded-full border px-3 py-1 text-[10.5px] uppercase tracking-wide transition ${
                  brand === item ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 px-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-60 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-[12px] text-muted-foreground">
            {bi('该分类暂无商品', 'Nothing in this category yet')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {visible.map((item) => (
              <ShopCard key={item.id} item={item} agent={agent} />
            ))}
          </div>
        )}
      </div>

      <ShopCart
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <ShopCheckout open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
}