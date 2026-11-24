import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import BookNowSheet from '@/components/booking/BookNowSheet';
import FavouriteButton from '@/components/FavouriteButton';
import { useAgent, withAgentDiscount } from '@/lib/AgentContext';
import { isSeasonPass } from '@/lib/passes';
import { isBikeRental } from '@/lib/bikeRental';
import { formatNZD } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { categoryLabel, localizedField, priceUnitOf } from '@/lib/i18n/localize';

export default function ProductCard({ product }) {
  const { lang, t, bi } = useLanguage();
  const { agent } = useAgent();
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigate = useNavigate();
  const name = localizedField(product, 'name', lang);
  const summary = localizedField(product, 'summary', lang);
  const duration = localizedField(product, 'duration', lang) || t('product.durationFallback');
  const price = withAgentDiscount(product.price, agent);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:shadow-md">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-32 w-full overflow-hidden bg-secondary">
          <Image
            src={product.image_url}
            alt={name}
            fittingType="fill"
            className="h-32 w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white backdrop-blur">
            {categoryLabel(product.category, lang)}
          </span>
          {agent && (
            <span className="absolute left-3 top-9 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
              {bi('代理价', 'Agent price')} -{agent.rate}%
            </span>
          )}
          <FavouriteButton product={product} className="absolute right-3 top-3" />
        </div>
        <div className="px-4 pt-4">
          <h3 className="font-heading text-[15px] leading-snug">{name}</h3>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
            {summary}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" /> {duration}
          </span>
        </div>
      </Link>

      <div className="mt-3 flex items-end justify-between gap-2 border-t border-border/70 px-4 py-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-[18px] text-primary">{formatNZD(price)}</span>
            {agent && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatNZD(product.price)}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{priceUnitOf(product, lang)}</p>
        </div>
        <Button
          type="button"
          className="h-9 shrink-0 rounded-full px-4 text-[12px]"
          onClick={() =>
            isSeasonPass(product)
              ? navigate(`/configure/${product.id}`)
              : isBikeRental(product)
                ? navigate(`/bike/${product.id}`)
                : setPickerOpen(true)
          }
        >
          {bi('立即预订', 'Book now')} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <BookNowSheet product={product} open={pickerOpen} onOpenChange={setPickerOpen} />
    </article>
  );
}