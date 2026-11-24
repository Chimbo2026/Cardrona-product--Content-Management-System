import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import ShopCard from '@/components/shop/ShopCard';
import ShopCart from '@/components/shop/ShopCart';
import ShopCheckout from '@/components/shop/ShopCheckout';
import { useCart } from '@/lib/CartContext';
import { useAgent } from '@/lib/AgentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ShopNew() {
  const { t } = useLanguage();
  const { agent } = useAgent();
  const { count } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () =>
        base44.entities.ShopItem.filter(
          { status: 'active', is_new: true },
          { sort: 'sort_order', limit: 50 },
        ),
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

  return (
    <div className="flex min-h-full flex-col pb-4">
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/90 px-4 py-2.5 backdrop-blur">
        <Link
          to="/shop"
          className="flex flex-1 items-center gap-0.5 text-[11.5px] text-muted-foreground"
        >
          {t('shop.all')}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
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

      <div className="flex-1 px-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-60 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-[12px] text-muted-foreground">
            {t('shop.newEmpty')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {items.map((item) => (
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