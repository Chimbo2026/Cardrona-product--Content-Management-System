import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, ShoppingBag } from 'lucide-react';
import { usePassCart } from '@/lib/PassCartContext';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import { useFavourites } from '@/lib/favourites';
import ProductCard from '@/components/ProductCard';
import BookingExtras from '@/components/booking/BookingExtras';
import { CATEGORY_OPTIONS } from '@/lib/booking';
import { categoryLabel } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { withCardronaCatalog } from '@/lib/cardronaProducts';

const FILTERS = [
  { key: '全部', zh: '全部', en: 'All' },
  { key: 'group:summer-biking', zh: '夏季骑行', en: 'Summer biking' },
  { key: 'group:mountain-carting', zh: '山地卡丁车', en: 'Mountain carting' },
  { key: 'group:sightseeing', zh: '观光', en: 'Sightseeing' },
  { key: 'group:winter-passes', zh: '冬季季票', en: 'Winter passes' },
  ...CATEGORY_OPTIONS.map((key) => ({ key, zh: key, en: categoryLabel(key, 'en') })),
];

export default function Tickets() {
  const { lang, t, bi } = useLanguage();
  const params = new URLSearchParams(window.location.search);
  const [category, setCategory] = useState(params.get('cat') || '全部');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const favourites = useFavourites();
  const { count: cartCount } = usePassCart();

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () => base44.entities.Product.filter({ status: 'active' }, { sort: 'sort_order', limit: 50 }),
      { items: [] },
    )
      .then((page) => {
        if (active) setProducts(withCardronaCatalog(page.items || []));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = products.filter((item) => {
    if (category === '全部') return true;
    if (category.startsWith('group:')) return item.catalog_group === category.slice(6);
    return item.category === category;
  });

  return (
    <div className="pb-24">
      <div className="px-4 pt-3">
        <BookingExtras />
      </div>

      <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/90 px-4 py-2.5 backdrop-blur">
        <div className="flex flex-1 gap-1.5 overflow-x-auto scrollbar-none">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCategory(item.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px] transition ${
                category === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {item.key === '全部' ? t('tickets.all') : (lang === 'en' ? item.en : item.zh)}
            </button>
          ))}
        </div>
        <Link
          to="/pass-cart"
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground/70"
          aria-label={bi('购物车', 'Cart')}
        >
          <ShoppingBag className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary px-1 text-[8.5px] font-medium text-primary-foreground">
              {cartCount}
            </span>
          )}
        </Link>
        <Link
          to="/favorites"
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground/70"
          aria-label={t('favorites.title')}
        >
          <Heart className="h-4 w-4" />
          {favourites.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary px-1 text-[8.5px] font-medium text-primary-foreground">
              {favourites.length}
            </span>
          )}
        </Link>
      </div>

      <div className="px-4 pt-2">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-[12px] text-muted-foreground">
            {bi('该雪场或分类暂无产品，试试切换筛选条件', 'Nothing matches these filters, try another resort or category')}
          </p>
        ) : (
          <>
            <p className="mb-2 px-1 text-[11px] text-muted-foreground">
              {bi(`共 ${visible.length} 个产品可选`, `${visible.length} products available`)}
            </p>
            <div className="space-y-3">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
