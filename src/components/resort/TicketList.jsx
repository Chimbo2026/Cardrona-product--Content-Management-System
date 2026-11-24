import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function TicketList({ tab }) {
  const { lang, bi } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () => base44.entities.Product.filter({ status: 'active' }, { sort: 'sort_order', limit: 50 }),
      { items: [] },
    )
      .then((page) => {
        if (active) setProducts((page.items || []).filter(tab.match));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab.key]);

  return (
    <div className="space-y-3">
      <p className="rounded-2xl bg-secondary px-3.5 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
        {tab.intro[lang] || tab.intro.zh}
      </p>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-[12px] text-muted-foreground">
          {bi('该票种暂未开放，可查看全部票券。', 'This ticket type is not open yet, see all tickets instead.')}
        </p>
      ) : (
        products.map((product) => <ProductCard key={product.id} product={product} />)
      )}

      <Link
        to="/booking"
        className="block rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-3.5 py-3 text-center text-[11.5px] font-medium text-primary"
      >
        {bi('查看全部票券与档期', 'See all tickets and dates')}
      </Link>
    </div>
  );
}