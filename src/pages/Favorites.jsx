import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProductCard from '@/components/ProductCard';
import ShopCard from '@/components/shop/ShopCard';
import { useAgent } from '@/lib/AgentContext';
import { useFavourites } from '@/lib/favourites';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CARDRONA_PRODUCTS } from '@/lib/cardronaProducts';

export default function Favorites() {
  const { t } = useLanguage();
  const { agent } = useAgent();
  const ids = useFavourites();
  const key = ids.join(',');
  const [products, setProducts] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      setShopItems([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    setFailed(false);
    Promise.all([
      base44.entities.Product.filter({ status: 'active' }, { limit: 100 }),
      base44.entities.ShopItem.filter({ status: 'active' }, { limit: 100 }),
    ])
      .then(([productPage, shopPage]) => {
        if (!active) return;
        const ordered = (list) =>
          ids.map((id) => (list || []).find((item) => item.id === id)).filter(Boolean);
        setProducts(ordered([...(productPage.items || []), ...CARDRONA_PRODUCTS]));
        setShopItems(ordered(shopPage.items));
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reloadKey]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-[12.5px] text-muted-foreground">
          {t('favorites.loadFailed')}
        </p>
        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="rounded-full bg-primary px-4 py-2 text-[11.5px] font-medium text-primary-foreground"
        >
          {t('favorites.retry')}
        </button>
      </div>
    );
  }

  const total = products.length + shopItems.length;

  if (!total) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Heart className="h-6 w-6" />
        </span>
        <p className="text-[12.5px] text-muted-foreground">{t('favorites.empty')}</p>
        <Link
          to="/booking"
          className="rounded-full bg-primary px-4 py-2 text-[11.5px] font-medium text-primary-foreground"
        >
          {t('favorites.browse')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pb-6 pt-3">
      <p className="text-[11px] text-muted-foreground">{t('favorites.count', { n: total })}</p>

      {shopItems.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {shopItems.map((item) => (
            <ShopCard key={item.id} item={item} agent={agent} />
          ))}
        </div>
      )}

      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
