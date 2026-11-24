import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PlaceCard from '@/components/resort/PlaceCard';
import MenuSheet from '@/components/resort/MenuSheet';
import StaySheet from '@/components/resort/StaySheet';
import TicketList from '@/components/resort/TicketList';
import { CAFES, ACTIVITIES, STAYS, TICKET_TABS, OFFICIAL_EVENTS_URL } from '@/lib/resort';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const TABS = [
  { key: 'cafes', label: { zh: '餐饮咖啡', en: 'Cafés & restaurants' }, items: CAFES, linkLabel: { zh: '查看菜单', en: 'See menu' } },
  { key: 'activities', label: { zh: '活动体验', en: 'Events & activities' }, items: ACTIVITIES, linkLabel: { zh: '了解详情', en: 'Learn more' } },
  { key: 'stays', label: { zh: '山上住宿', en: 'Accommodation' }, items: STAYS, linkLabel: { zh: '立即预订', en: 'Book now' } },
  ...TICKET_TABS.map((item) => ({ ...item, tickets: true })),
];

export default function Resort() {
  const { lang, bi } = useLanguage();
  const navigate = useNavigate();
  const initialTab = new URLSearchParams(window.location.search).get('tab');
  const [tab, setTab] = useState(TABS.some((item) => item.key === initialTab) ? initialTab : 'cafes');
  const [orderCafe, setOrderCafe] = useState(null);
  const [bookStay, setBookStay] = useState(null);
  const current = TABS.find((item) => item.key === tab) || TABS[0];

  return (
    <div className="pb-20">
      <div className="px-4 pt-3">
        <h1 className="font-heading text-[17px] font-semibold">{bi('山上吃住玩', 'Eat, stay & play')}</h1>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {bi(
            '9 家山上山下餐厅、全年活动与滑进滑出的山上公寓，资料与图片来自 Cardrona / Treble Cone 官网。',
            'Nine on-mountain eateries, year-round events and ski-in apartments. Photos and details from the Cardrona / Treble Cone website.',
          )}
        </p>
      </div>

      <div className="sticky top-0 z-10 mt-2 flex gap-1.5 overflow-x-auto bg-background/90 px-4 py-2.5 backdrop-blur scrollbar-none">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px] transition ${
              tab === item.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {item.label[lang] || item.label.zh}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-4 pt-1">
        {current.tickets && <TicketList tab={current} />}

        {(current.items || []).map((item) => {
          let action = null;
          if (tab === 'cafes') {
            action = { label: bi('点餐', 'Order food'), run: () => setOrderCafe(item) };
          } else if (tab === 'stays') {
            action = { label: bi('在线预订', 'Book here'), run: () => setBookStay(item) };
          } else if (tab === 'activities' && item.bookPath) {
            action = { label: bi('立即预订', 'Book now'), run: () => navigate(item.bookPath) };
          } else if (tab === 'activities' && item.bookUrl) {
            action = {
              label: bi('立即预订', 'Book now'),
              run: () => window.open(item.bookUrl, '_blank', 'noreferrer'),
            };
          }
          return (
            <PlaceCard
              key={item.id}
              item={item}
              lang={lang}
              linkLabel={current.linkLabel[lang] || current.linkLabel.zh}
              onOrder={action?.run}
              orderLabel={action?.label}
            />
          );
        })}

        {tab === 'activities' && (
          <a
            href={OFFICIAL_EVENTS_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-3.5 py-3"
          >
            <span className="text-[11.5px] font-medium text-primary">
              {bi('查看官网完整活动日历', 'See the full events calendar')}
            </span>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </a>
        )}

        <p className="pt-1 text-center text-[10px] leading-relaxed text-muted-foreground">
          {bi(
            '营业时间与房间配置以官网最新公告为准。',
            'Opening hours and room configurations follow the latest notice on the official site.',
          )}
        </p>
      </div>

      {orderCafe && <MenuSheet cafe={orderCafe} onClose={() => setOrderCafe(null)} />}
      {bookStay && <StaySheet stay={bookStay} onClose={() => setBookStay(null)} />}
    </div>
  );
}