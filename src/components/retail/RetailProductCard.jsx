import { ArrowUpRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';

export default function RetailProductCard({ product }) {
  const { t } = useLang();
  const discounted = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(77,22,19,0.05)] transition-shadow hover:shadow-[0_6px_20px_rgba(77,22,19,0.08)]">
      <div className="relative aspect-square overflow-hidden bg-[#f7f4f3]">
        <Image
          src={product.image_url}
          alt={product.name}
          fittingType="fit"
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.is_new && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-forest-700 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white">
            {t('新到货', 'New')}
          </span>
        )}
        {discounted && (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-ice-500 px-1.5 py-0.5 text-[9.5px] font-semibold text-white">
            {t('特价', 'Sale')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">{product.vendor}</p>
        <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-forest-950">{product.name}</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">{product.category}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="num text-[15px] font-semibold text-forest-900">{NZD(product.price)}</p>
            {discounted && (
              <p className="num text-[11px] text-muted-foreground line-through">{NZD(product.compare_at_price)}</p>
            )}
          </div>
          <a
            href={product.product_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-forest-800 transition-colors hover:border-forest-300 hover:bg-forest-50"
          >
            {t('官网购买', 'Shop')} <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}