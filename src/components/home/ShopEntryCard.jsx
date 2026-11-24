import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCart } from '@/lib/CartContext';

export default function ShopEntryCard() {
  const { t } = useLanguage();
  const { count } = useCart();

  return (
    <Link
      to="/shop"
      className="flex flex-col justify-between rounded-2xl p-3.5 shadow-sm transition active:scale-[0.99] snow-ridge text-white"
    >
      <div className="flex items-start justify-between">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
          <ShoppingBag className="h-[18px] w-[18px]" />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[9px] font-semibold text-primary">
              {count}
            </span>
          )}
        </span>
        <ArrowRight className="h-3.5 w-3.5 opacity-60" />
      </div>
      <div className="mt-6">
        <p className="font-heading text-[16px] leading-tight">{t('home.lane.shop')}</p>
        <p className="mt-1 text-[10.5px] leading-relaxed text-white/70">{t('home.lane.shopSub')}</p>
        <span className="mt-2 inline-block rounded-full bg-white/15 px-2 py-[2px] text-[9px] tracking-wide text-white/85">
          {t('home.lane.shopTag')}
        </span>
      </div>
    </Link>
  );
}