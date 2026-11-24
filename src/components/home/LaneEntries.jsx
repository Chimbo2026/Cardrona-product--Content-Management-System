import { Link } from 'react-router-dom';
import { ArrowRight, Ticket } from 'lucide-react';
import ShopEntryCard from '@/components/home/ShopEntryCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LaneEntries() {
  const { t } = useLanguage();

  return (
    <section className="mt-3 px-4">
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          to="/booking"
          className="flex flex-col justify-between rounded-2xl p-3.5 shadow-sm transition active:scale-[0.99] snow-ridge text-white"
        >
          <div className="flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
              <Ticket className="h-[18px] w-[18px]" />
            </span>
            <ArrowRight className="h-3.5 w-3.5 opacity-60" />
          </div>
          <div className="mt-6">
            <p className="font-heading text-[16px] leading-tight">{t('home.lane.ski')}</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-white/70">{t('home.lane.skiSub')}</p>
            <span className="mt-2 inline-block rounded-full bg-white/15 px-2 py-[2px] text-[9px] tracking-wide text-white/85">
              {t('home.lane.skiTag')}
            </span>
          </div>
        </Link>

        <ShopEntryCard />
      </div>
    </section>
  );
}