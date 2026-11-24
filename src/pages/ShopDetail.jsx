import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, PackageCheck, ShieldCheck, ShoppingBag, Snowflake } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import FavouriteButton from '@/components/FavouriteButton';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/lib/CartContext';
import { useAgent, withAgentDiscount } from '@/lib/AgentContext';
import { formatNZD } from '@/lib/shop';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ShopDetail() {
  const { id } = useParams();
  const { lang, t, bi } = useLanguage();
  const { agent } = useAgent();
  const { add } = useCart();
  const { toast } = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let active = true;
    base44.entities.ShopItem.get(id)
      .then((record) => {
        if (!active) return;
        setItem(record);
        setSize((record.sizes || [])[0] || '均码');
      })
      .catch(() => {
        if (active) setItem(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (loading || item) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, [loading, item]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[13px]">{bi('商品不存在或已下架', 'This item is unavailable')}</p>
        <Button asChild className="mt-4 h-10 rounded-full px-5">
          <Link to="/shop">{bi('返回山地商店', 'Back to the store')}</Link>
        </Button>
      </div>
    );
  }

  const name = lang === 'en' ? item.name_en || item.name_zh : item.name_zh;
  const summary = lang === 'en' ? item.summary_en || item.summary_zh : item.summary_zh;
  const price = Number(item.price || 0);
  const finalPrice = withAgentDiscount(price, agent);
  const sizes = item.sizes && item.sizes.length > 0 ? item.sizes : ['均码'];

  return (
    <div className="pb-6">
      <div className="relative">
        <div className="aspect-[4/5] w-full overflow-hidden bg-secondary">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={name}
              fittingType="fill"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <Snowflake className="h-12 w-12" />
            </div>
          )}
        </div>
        <Link
          to="/shop"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
          aria-label={bi('返回', 'Back')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {item.is_new && (
          <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] text-primary-foreground">
            {bi('新品上架', 'New in')}
          </span>
        )}
        <FavouriteButton id={item.id} className="absolute right-3 top-3" />
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {item.brand && <span className="uppercase tracking-wide">{item.brand}</span>}
          <span>·</span>
          <span>{item.category}</span>
        </div>
        <h1 className="mt-1 font-heading text-[19px] leading-snug">{name}</h1>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{summary}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-[24px] text-primary">
            {formatNZD(agent ? finalPrice : price)}
          </span>
          {agent && (
            <span className="text-[12px] text-muted-foreground line-through">
              {formatNZD(price)}
            </span>
          )}
          {agent && (
            <span className="rounded-full bg-emerald-50 px-2 py-[2px] text-[10px] font-medium text-emerald-700">
              {agent.label} -{agent.rate}%
            </span>
          )}
        </div>

        <div className="mt-5">
          <p className="text-[11.5px] font-medium">{bi('尺码', 'Size')}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                className={`min-w-[46px] rounded-full border px-3 py-1.5 text-[11.5px] transition ${
                  size === option
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {option === '均码' ? bi('均码', 'One size') : option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11.5px] font-medium">{bi('数量', 'Quantity')}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-[14px] leading-none text-muted-foreground"
              aria-label={bi('减少数量', 'Decrease quantity')}
            >
              −
            </button>
            <span className="w-6 text-center text-[12.5px]">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-[14px] leading-none text-muted-foreground"
              aria-label={bi('增加数量', 'Increase quantity')}
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-2 rounded-2xl bg-secondary/60 p-3">
          <div className="flex items-start gap-2 text-[11px] leading-relaxed">
            <PackageCheck className="mt-[1px] h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {bi(
                '顺丰国际直邮 7–12 个工作日 · 新西兰酒店配送或门店自提可选',
                'SF Express International in 7–12 business days · or NZ hotel delivery / store pickup',
              )}
            </span>
          </div>
          <div className="flex items-start gap-2 text-[11px] leading-relaxed">
            <ShieldCheck className="mt-[1px] h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {bi(
                '支持微信支付与国际信用卡 · 30 天无理由退换（吊牌完好）',
                'WeChat Pay and international cards · 30-day returns with tags attached',
              )}
            </span>
          </div>
          <div className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <Check className="mt-[1px] h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {bi(
                '演示环境：商品数据同步自 shop.cardrona.com（Shopify），不会真实下单',
                'Demo build: catalogue mirrors shop.cardrona.com (Shopify); no real order is placed',
              )}
            </span>
          </div>
        </div>

        <Button
          className="mt-5 h-11 w-full rounded-full"
          onClick={() => {
            add(item, size, qty);
            toast({ title: t('shop.added') });
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          {t('shop.add')} · {formatNZD((agent ? finalPrice : price) * qty)}
        </Button>

        <Link
          to="/shop"
          className="mt-3 block text-center text-[11.5px] text-muted-foreground underline-offset-2 hover:underline"
        >
          {bi('继续浏览新品', 'Keep browsing new arrivals')}
        </Link>
      </div>
    </div>
  );
}