import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Clock, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import { Image } from '@/components/ui/image';
import IntegrationNotice from '@/components/IntegrationNotice';
import PassConfigurator from '@/components/product/PassConfigurator';
import { Button } from '@/components/ui/button';
import { formatCNY } from '@/lib/booking';
import { isSeasonPass } from '@/lib/passes';
import { isBikeRental } from '@/lib/bikeRental';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { categoryLabel, localizedField, localizedList, priceUnitOf } from '@/lib/i18n/localize';
import BookNowSheet from '@/components/booking/BookNowSheet';
import { catalogProduct } from '@/lib/cardronaProducts';

export default function ProductDetail() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    loadWithRetry(() => base44.entities.Product.get(id))
      .then((record) => {
        if (active) setProduct(record || catalogProduct(id));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-[13px] text-muted-foreground">{t('product.missing')}</div>
    );
  }

  const name = localizedField(product, 'name', lang);
  const summary = localizedField(product, 'summary', lang);
  const description = localizedField(product, 'description', lang);
  const includes = localizedList(product, 'includes', lang);
  const duration = localizedField(product, 'duration', lang) || t('product.durationFallback');
  const audience = localizedField(product, 'audience', lang) || t('product.audienceFallback');
  const unit = priceUnitOf(product, lang);
  const capacityUnit =
    product.category === '课程' ? t('product.capacity.course') : t('product.capacity.guest');
  const seasonPass = isSeasonPass(product);

  return (
    <div className={seasonPass ? 'pb-10' : 'pb-40'}>
      <div className="h-52 w-full overflow-hidden bg-secondary">
        <Image
          src={product.image_url}
          alt={name}
          fittingType="fill"
          className="h-52 w-full object-cover"
        />
      </div>

      <section className="px-4 pt-4">
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
          {categoryLabel(product.category, lang)}
        </span>
        <h1 className="mt-2 font-heading text-[20px] leading-snug">{name}</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{summary}</p>

        <div className="mt-4 flex items-end gap-1.5">
          <span className="font-heading text-[26px] text-primary">{formatCNY(product.price)}</span>
          <span className="pb-1 text-[11px] text-muted-foreground">{unit}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
            <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="text-muted-foreground">{duration}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
            <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="text-muted-foreground">{audience}</span>
          </div>
        </div>
      </section>

      {description && (
        <section className="mt-5 px-4">
          <h2 className="font-heading text-[15px]">{t('product.description')}</h2>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{description}</p>
        </section>
      )}

      {includes.length > 0 && (
        <section className="mt-5 px-4">
          <h2 className="font-heading text-[15px]">{t('product.includes')}</h2>
          <div className="mt-2 space-y-1.5">
            {includes.map((item) => (
              <div key={item} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {seasonPass && (
        <section className="mt-5 px-4">
          <PassConfigurator product={product} />
        </section>
      )}

      {!seasonPass && (
      <section className="mt-5 px-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <h2 className="font-heading text-[14px]">{t('product.pricing')}</h2>
          </div>
          <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
            <p>
              {t('product.regular', { price: formatCNY(product.price), unit })}
            </p>
            <p>
              {t('product.peak', {
                price: formatCNY(Number(product.price || 0) * Number(product.peak_multiplier || 1)),
                multiplier: product.peak_multiplier || 1,
              })}
            </p>
            <p>
              {product.capacity_per_day
                ? t('product.capacity', { n: product.capacity_per_day, unit: capacityUnit })
                : t('product.capacity', { n: t('product.capacity.unlimited'), unit: '' })}
            </p>
          </div>
          <IntegrationNotice type="aspenware" className="mt-3" />
        </div>
      </section>
      )}

      <section className="mt-4 px-4">
        <div className="flex items-start gap-2 rounded-2xl border border-border bg-muted/40 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{t('product.notice')}</span>
        </div>
      </section>

      {!seasonPass && (
        <div className="fixed inset-x-0 bottom-[calc(62px+env(safe-area-inset-bottom))] z-30 mx-auto max-w-[430px] border-t border-border bg-background/95 p-4 backdrop-blur md:absolute">
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <p className="text-[10px] text-muted-foreground">{t('product.from')}</p>
              <p className="font-heading text-[17px] text-primary">{formatCNY(product.price)}</p>
            </div>
            {product.booking_options?.length ? (
              <Button className="h-11 flex-1 rounded-full" onClick={() => setPickerOpen(true)}>
                {t('product.book')}
              </Button>
            ) : (
              <Button asChild className="h-11 flex-1 rounded-full">
                <Link to={isBikeRental(product) ? `/bike/${product.id}` : `/booking/${product.id}`}>
                  {t('product.book')}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
      <BookNowSheet product={product} open={pickerOpen} onOpenChange={setPickerOpen} />
    </div>
  );
}
