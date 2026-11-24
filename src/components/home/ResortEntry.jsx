import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { CAFES, ACTIVITIES, STAYS } from '@/lib/resort';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const TILES = [
  { key: 'cafes', image: CAFES[0].image, label: { zh: '餐饮咖啡', en: 'Cafés' } },
  { key: 'activities', image: ACTIVITIES[0].image, label: { zh: '活动体验', en: 'Activities' } },
  { key: 'stays', image: STAYS[1].image, label: { zh: '山上住宿', en: 'Stay' } },
];

export default function ResortEntry() {
  const { lang, bi } = useLanguage();

  return (
    <section className="mt-3 px-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold">{bi('山上吃住玩', 'Eat, stay & play')}</h2>
        <Link to="/resort" className="flex items-center text-[11px] text-muted-foreground">
          {bi('全部', 'All')} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {TILES.map((tile) => (
          <Link
            key={tile.key}
            to={`/resort?tab=${tile.key}`}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="aspect-square w-full bg-secondary">
              <Image
                src={tile.image}
                alt={tile.label[lang] || tile.label.zh}
                className="h-full w-full"
              />
            </div>
            <p className="py-1.5 text-center text-[11px] font-medium">{tile.label[lang] || tile.label.zh}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}