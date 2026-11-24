import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ChevronRight, MapPin, Ruler, Sparkles, Shirt } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import { toDateKey } from '@/lib/booking';
import LessonsTable from '@/components/lessons/LessonsTable';
import RentalSummary from '@/components/rentals/RentalSummary';
import PickupInfo from '@/components/rentals/PickupInfo';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const tomorrow = () => toDateKey(new Date(Date.now() + 86400000));
const ICONS = [MapPin, Ruler, Sparkles, Shirt];

export default function Rentals() {
  const { bi } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(tomorrow);

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () => base44.entities.Product.filter({ category: '租赁', status: 'active' }, { sort: 'sort_order', limit: 50 }),
      { items: [] },
    )
      .then((page) => {
        if (!active) return;
        const list = (page.items || []).filter((item) => item.rental_kind !== 'bike');
        setItems(list);
        setSelected(list[0] || null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const highlights = [
    { zh: '山上与城镇取还', en: 'On & off-mountain pick up', zhSub: '山上、瓦纳卡、皇后镇均可取', enSub: 'Collect on mountain, in Wānaka or Queenstown' },
    { zh: '专业试穿调整', en: 'Professionally fitted', zhSub: '舒适与性能都照顾到', enSub: 'The right fit for comfort and control' },
    { zh: '可升级高端装备', en: 'Upgrade to premium', zhSub: '按雪况挑选刻滑或野雪板', enSub: 'Performance gear tuned to conditions' },
    { zh: '服装配件齐全', en: 'Full gear & clothing', zhSub: '单件或整套自由搭配', enSub: 'From single items to full bundles' },
  ];

  const book = () => {
    if (!selected) return;
    navigate(`/booking/${selected.id}?date=${date}&guests=1`);
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-4">
        <nav className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            {bi('首页', 'Home')}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{bi('装备租赁', 'Rentals')}</span>
        </nav>
        <p className="mt-2 text-[10.5px] font-medium tracking-wide text-primary">
          {bi('滑雪与单板装备', 'SKI & SNOWBOARD HIRE')}
        </p>
        <h1 className="mt-1 font-heading text-[22px] leading-tight">
          {bi('雪具与服装租赁', 'Equipment & clothing rentals')}
        </h1>
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {bi(
            '在山上或瓦纳卡、皇后镇的门店轻松租到雪具。从初学者用的入门板到进阶刻滑、公园与野雪装备，再到雪服、头盔与雪镜，一套配齐只用一个预订。',
            'Hire your ski and snowboard gear on mountain or in Wānaka and Queenstown. From beginner setups to carving, park and powder hardware, plus clothing, helmets and goggles in one simple booking.',
          )}
        </p>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-2 px-4">
        {highlights.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <div key={item.en} className="rounded-xl border border-border bg-card px-3 py-2.5">
              <Icon className="h-4 w-4 text-primary" />
              <p className="mt-1.5 text-[11.5px] font-medium leading-snug">{bi(item.zh, item.en)}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                {bi(item.zhSub, item.enSub)}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-5 px-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold">{bi('选择装备', 'Choose your gear')}</h2>
          <span className="text-[10.5px] text-muted-foreground">
            {bi('每人每天', 'Per person / day')}
          </span>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-[12px] text-muted-foreground">
            {bi('暂无可租装备，请稍后再来看看。', 'No rental gear available right now.')}
          </p>
        ) : (
          <LessonsTable lessons={items} selectedId={selected?.id} onSelect={setSelected} />
        )}

        <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
          {bi(
            '也可以只租单件装备；手套不含在套餐内，可现场购买。多日租赁按天数计价，装备可寄存在山上。',
            'Individual items can be hired too. Gloves are not included but can be purchased in store. Multi-day hires are priced per day, with on-mountain overnight storage.',
          )}
        </p>
      </section>

      <section className="mt-4 px-4">
        <RentalSummary item={selected} date={date} onDateChange={setDate} onBook={book} />
      </section>

      <section className="mt-4 px-4">
        <PickupInfo />
      </section>

    </div>
  );
}