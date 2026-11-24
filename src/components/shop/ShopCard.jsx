import { Link } from 'react-router-dom';
import { ShoppingBag, Snowflake } from 'lucide-react';
import { Image } from '@/components/ui/image';
import FavouriteButton from '@/components/FavouriteButton';
import { formatNZD } from '@/lib/shop';
import { withAgentDiscount } from '@/lib/AgentContext';
import { useCart } from '@/lib/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { shopCategoryLabel } from '@/lib/i18n/localize';

export default function ShopCard({ item, agent }) {
  const { lang, t, bi } = useLanguage();
  const { add } = useCart();
  const { toast } = useToast();
  const name = lang === 'en' ? item.name_en || item.name_zh : item.name_zh;
  const price = Number(item.price || 0);
  const finalPrice = withAgentDiscount(price, agent);
  const defaultSize = (item.sizes || [])[0] || '均码';

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Link to={`/shop/${item.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-secondary">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={name}
              fittingType="fill"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <Snowflake className="h-9 w-9" />
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-[2px] text-[9px] text-white backdrop-blur">
            {shopCategoryLabel(item.category, lang)}
          </span>
          {item.is_new && (
            <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-[2px] text-[9px] text-primary-foreground">
              {bi('新品', 'New')}
            </span>
          )}
          <FavouriteButton id={item.id} className="absolute right-2 top-2" />
        </div>
      </Link>

      <div className="p-2.5">
        {item.brand && (
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{item.brand}</p>
        )}
        <Link to={`/shop/${item.id}`}>
          <p className="line-clamp-2 min-h-[32px] text-[12px] font-medium leading-snug">{name}</p>
        </Link>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
          <span className="font-heading text-[15px] text-primary">{formatNZD(agent ? finalPrice : price)}</span>
          {agent && (
            <span className="text-[10px] text-muted-foreground line-through">{formatNZD(price)}</span>
          )}
        </div>
        {agent && (
          <p className="mt-0.5 text-[9.5px] font-medium text-emerald-700">
            {t('shop.agentPrice')} · -{agent.rate}%
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            add(item, defaultSize);
            toast({ title: t('shop.added') });
          }}
          className="mt-2 flex h-8 w-full items-center justify-center gap-1 rounded-full bg-primary text-[11.5px] font-medium text-primary-foreground transition active:scale-[0.98]"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {t('shop.add')}
        </button>
      </div>
    </div>
  );
}