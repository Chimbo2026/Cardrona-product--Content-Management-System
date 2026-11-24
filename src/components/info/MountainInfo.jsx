import { Mountain, Snowflake, Clock, Baby } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const MOUNTAINS = [
  {
    key: 'cardrona',
    name: '卡德罗纳 Cardrona',
    tag: { zh: '皇后镇 · 瓦纳卡之间', en: 'Between Queenstown and Wanaka' },
    stats: [
      { label: { zh: '海拔', en: 'Elevation' }, value: '1,260 – 1,860 m' },
      { label: { zh: '雪道', en: 'Trails' }, value: { zh: '65 条 · 465 公顷', en: '65 runs · 465 ha' } },
      { label: { zh: '最长雪道', en: 'Longest run' }, value: '4 km' },
    ],
    open: { zh: '6 月中旬 – 10 月中旬', en: 'Mid June – Mid October' },
    notes: [
      { zh: '奥运级公园与半管场地', en: 'Olympic-grade park and halfpipe' },
      { zh: '南半球最大初学者区', en: 'The largest beginner area in the southern hemisphere' },
      { zh: '山上有 4 家餐厅与雪具租赁', en: 'Four restaurants and rental on the mountain' },
    ],
  },
  {
    key: 'treble-cone',
    name: '三锥山 Treble Cone',
    tag: { zh: '瓦纳卡湖畔', en: 'On the shore of Lake Wanaka' },
    stats: [
      { label: { zh: '海拔', en: 'Elevation' }, value: '1,260 – 1,960 m' },
      { label: { zh: '雪道', en: 'Trails' }, value: { zh: '44 条 · 550 公顷', en: '44 runs · 550 ha' } },
      { label: { zh: '最长雪道', en: 'Longest run' }, value: '4 km' },
    ],
    open: { zh: '6 月下旬 – 9 月下旬', en: 'Late June – Late September' },
    notes: [
      { zh: '南岛最大垂直落差 700 m', en: 'The South Island’s biggest vertical drop at 700 m' },
      { zh: '中高级雪道为主', en: 'Mostly intermediate and advanced terrain' },
      { zh: '湖景视野极佳', en: 'Outstanding lake views' },
    ],
  },
];

export default function MountainInfo() {
  const { lang, bi } = useLanguage();
  const tr = (value) => (typeof value === 'string' ? value : value[lang === 'en' ? 'en' : 'zh']);

  return (
    <div className="space-y-3 px-4 pt-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
          <Mountain className="h-5 w-5" />
        </span>
        <h1 className="mt-3 font-heading text-[17px]">{bi('双雪山通行证', 'Two-mountain passes')}</h1>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          {bi(
            '雪峰预订中心同时售卖卡德罗纳与三锥山雪票，同一张订单可在两座山之间安排行程，季票通用。',
            'Snow Peak Booking sells passes for both Cardrona and Treble Cone, so one booking can cover days on either mountain and season passes work at both.',
          )}
        </p>
      </div>

      {MOUNTAINS.map((mountain) => (
        <div key={mountain.key} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-heading text-[15px]">{mountain.name}</h2>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">{tr(mountain.tag)}</p>
            </div>
            <Snowflake className="h-4 w-4 shrink-0 text-primary" />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {mountain.stats.map((stat) => (
              <div key={stat.label.zh} className="rounded-xl bg-secondary/60 px-2.5 py-2">
                <p className="text-[9.5px] text-muted-foreground">{tr(stat.label)}</p>
                <p className="mt-0.5 text-[11px] font-medium leading-snug">{tr(stat.value)}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" /> {bi('雪季', 'Season')} {tr(mountain.open)}
          </p>
          <ul className="mt-2 space-y-1">
            {mountain.notes.map((note) => (
              <li
                key={note.zh}
                className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground"
              >
                <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-primary" />
                {tr(note)}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="flex items-start gap-2 rounded-2xl border border-dashed border-border bg-muted/50 p-3 text-[10.5px] leading-relaxed text-muted-foreground">
        <Baby className="mt-[1px] h-3.5 w-3.5 shrink-0 text-primary" />
        {bi(
          '3 岁以下儿童免费入场；12 岁以下需成人陪同。雪况与索道开放状态以当日山顶雪报为准。',
          'Children under 3 ride free; under 12s need an adult with them. Snow and lift status follows the daily on-mountain report.',
        )}
      </div>
    </div>
  );
}