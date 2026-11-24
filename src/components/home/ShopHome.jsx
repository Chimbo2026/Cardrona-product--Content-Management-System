import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import ShopCard from '@/components/shop/ShopCard';
import { useAgent } from '@/lib/AgentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ShopHome() {
  const { t } = useLanguage();
  const { agent } = useAgent();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () => base44.entities.ShopItem.filter({ status: 'active' }, { sort: 'sort_order', limit: 6 }),
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
    <div className="mt-3 px-4">
      <div className="flex items-center justify-between">
        <p className="font-heading text-[16px]">{t('home.shopNew')}</p>
        <Link to="/shop" className="text-[11px] font-medium text-primary">
          {t('home.shopAll')}
        </Link>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="h-60 animate-pulse rounded-2xl bg-muted/60" />
            ))
          : items.map((item) => <ShopCard key={item.id} item={item} agent={agent} />)}
      </div>

      <Link
        to="/shop"
        className="mt-3 flex h-10 items-center justify-center gap-1 rounded-full border border-border text-[12px] font-medium"
      >
        {t('home.shopAll')}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}