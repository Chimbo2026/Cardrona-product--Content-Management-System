import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SeasonPassBanner() {
  const { t } = useLanguage();

  return (
    <section className="mt-3 px-4">
      <Link
        to="/booking?cat=%E5%A5%97%E9%A4%90"
        className="snow-ridge block overflow-hidden rounded-2xl p-4 text-white shadow-sm transition active:scale-[0.99]"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/15 px-2.5 py-[3px] text-[10px] tracking-wide">
            {t('home.promo.badge')}
          </span>
          <span className="text-[9.5px] uppercase tracking-[0.18em] text-white/60">
            {t('home.promo.ends')}
          </span>
        </div>

        <p className="mt-3 font-heading text-[21px] italic leading-tight">{t('home.promo.title')}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-white/70">{t('home.promo.subtitle')}</p>

        <div className="mt-3.5 flex items-end justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-white/70">
            <Clock className="h-3 w-3" />
            {t('home.promo.countdown')}
            <span className="font-mono text-[11.5px] tracking-wider text-white">
              {t('home.promo.countdownValue')}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10.5px] font-medium text-primary">
            {t('home.promo.cta')}
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </section>
  );
}