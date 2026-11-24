import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBag, Snowflake } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { formatNZD } from '@/lib/shop';
import { useAgent, withAgentDiscount } from '@/lib/AgentContext';
import { useCart } from '@/lib/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BookingExtras() {
  const { lang, bi } = useLanguage();
  const { agent } = useAgent();
  const { add, count } = useCart();
  const { toast } = useToast();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    base44.entities.ShopItem.filter({ status: 'active' }, { sort: 'sort_order', limit: 6 })
      .then((page) => {
        if (active) setItems(page.items || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mt-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground/85">
          <ShoppingBag className="h-3.5 w-3.5 text-primary" />
          {bi('顺带加购山地装备', 'Add gear to your order')}
        </p>
        <Link to="/shop" className="text-[11px] text-primary">
          {count > 0 ? bi(`购物袋 ${count}`, `Bag ${count}`) : bi('逛商店', 'Shop')}
        </Link>
      </div>

      <div className="mt-2.5 flex gap-2 overflow-x-auto scrollbar-none">
        {items.map((item) => {
          const name = lang === 'en' ? item.name_en || item.name_zh : item.name_zh;
          const price = withAgentDiscount(item.price, agent);
          return (
            <div key={item.id} className="w-[96px] shrink-0">
              <Link to={`/shop/${item.id}`} className="block overflow-hidden rounded-xl bg-secondary">
                <div className="aspect-square w-full">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={name} fittingType="fill" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <Snowflake className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </Link>
              <p className="mt-1 line-clamp-2 min-h-[28px] text-[10.5px] leading-snug text-foreground/85">{name}</p>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="font-heading text-[11.5px] text-primary">{formatNZD(price)}</span>
                <button
                  type="button"
                  onClick={() => {
                    add(item, (item.sizes || [])[0] || '均码');
                    toast({ title: bi('已加入购物袋', 'Added to bag') });
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  aria-label={bi('加入购物袋', 'Add to bag')}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}