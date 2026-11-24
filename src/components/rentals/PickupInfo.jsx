import { MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PickupInfo() {
  const { bi } = useLanguage();

  const locations = [
    {
      zh: '山上租赁中心',
      en: 'On mountain',
      zhDetail: '卡德罗纳 / 三锥山，每日 08:30 起可取',
      enDetail: 'Cardrona and Treble Cone, from 8.30am daily',
    },
    {
      zh: '瓦纳卡门店',
      en: 'Wānaka store',
      zhDetail: '50 Cardrona Road，预订日前一天 15:00 起取',
      enDetail: '50 Cardrona Road, from 3pm the day before',
    },
    {
      zh: '皇后镇门店',
      en: 'Queenstown store',
      zhDetail: '37 Camp Street，预订日前一天 12:00 起取',
      enDetail: '37 Camp Street, from 12pm the day before',
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="text-[13px] font-semibold">{bi('取还与归还', 'Pick up & return')}</h2>
      </div>
      <ul className="divide-y divide-border">
        {locations.map((location) => (
          <li key={location.en} className="flex items-start gap-2.5 px-4 py-2.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[11.5px] font-medium">{bi(location.zh, location.en)}</p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">
                {bi(location.zhDetail, location.enDetail)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="flex items-start gap-1.5 border-t border-border px-4 py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
        <Clock className="mt-0.5 h-3 w-3 shrink-0" />
        {bi(
          '装备需归还至取用的门店；高端装备仅限山上取还。手套不含在租赁套餐内，可现场购买。',
          'Return gear to the location you collected it from. Premium gear is on-mountain only. Gloves are not included but can be purchased in store.',
        )}
      </p>
    </div>
  );
}