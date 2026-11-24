import { useState } from 'react';
import { Bus, Plane, Car, Hotel } from 'lucide-react';
import TransferSheet from '@/components/transport/TransferSheet';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const ROUTES = [
  {
    icon: Bus,
    title: { zh: '皇后镇 → 卡德罗纳', en: 'Queenstown → Cardrona' },
    detail: {
      zh: '约 55 分钟 · 每日 07:30 / 09:00 两班接驳车，需提前 24 小时预订',
      en: 'About 55 minutes · shuttle at 07:30 and 09:00 daily, book 24 hours ahead',
    },
  },
  {
    icon: Bus,
    title: { zh: '瓦纳卡 → 卡德罗纳', en: 'Wanaka → Cardrona' },
    detail: {
      zh: '约 35 分钟 · 每 30 分钟一班雪场巴士（Snowline Express）',
      en: 'About 35 minutes · Snowline Express bus every 30 minutes',
    },
  },
  {
    icon: Car,
    title: { zh: '自驾与停车', en: 'Driving and parking' },
    detail: {
      zh: '山脚停车场免费，雪季周末建议 08:30 前抵达；上山需携带防滑链',
      en: 'Base parking is free; on winter weekends arrive before 08:30 and carry chains',
    },
  },
  {
    icon: Plane,
    title: { zh: '机场接送', en: 'Airport transfers' },
    detail: {
      zh: '皇后镇机场（ZQN）至山脚约 50 分钟，可预订 7 座商务车接送',
      en: 'About 50 minutes from Queenstown Airport (ZQN); seven-seat transfers can be booked',
    },
  },
  {
    icon: Hotel,
    title: { zh: '住宿区域建议', en: 'Where to stay' },
    detail: {
      zh: '皇后镇中心、弗兰克顿、瓦纳卡湖畔均有合作酒店，含雪季早班接驳',
      en: 'Partner hotels in central Queenstown, Frankton and on Lake Wanaka, with winter morning shuttles',
    },
  },
];

export default function TransportGuide() {
  const { lang, bi } = useLanguage();
  const [booking, setBooking] = useState(false);
  const tr = (value) => value[lang === 'en' ? 'en' : 'zh'];

  return (
    <div className="space-y-3 px-4 pt-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h1 className="font-heading text-[17px]">{bi('抵达雪山', 'Getting to the mountain')}</h1>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          {bi(
            '卡德罗纳位于皇后镇与瓦纳卡之间的皇冠山脉公路，三锥山位于瓦纳卡湖畔。首次前往建议选择接驳车。',
            'Cardrona sits on the Crown Range road between Queenstown and Wanaka, and Treble Cone is on Lake Wanaka. First-time visitors usually take the shuttle.',
          )}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {ROUTES.map(({ icon: Icon, title, detail }, index) => (
          <div
            key={title.zh}
            className={`flex gap-3 px-4 py-3.5 ${index > 0 ? 'border-t border-border/70' : ''}`}
          >
            <span className="mt-[1px] flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12.5px] font-medium">{tr(title)}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{tr(detail)}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setBooking(true)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground"
      >
        <span className="text-left">
          <span className="block text-[12.5px] font-medium">{bi('预订接驳与机场接送', 'Book a shuttle or transfer')}</span>
          <span className="mt-0.5 block text-[10.5px] opacity-80">
            {bi('选日期与人数，结算时可修改', 'Pick date and passengers, editable at checkout')}
          </span>
        </span>
        <Bus className="h-4 w-4 shrink-0" />
      </button>

      <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-3 text-[10.5px] leading-relaxed text-muted-foreground">
        {bi(
          '接驳车需提前 24 小时预订，出发前一天会通过手机号确认车牌与集合点。',
          'Shuttles must be booked 24 hours ahead; we confirm the vehicle and meeting point by phone the day before.',
        )}
      </div>

      {booking && <TransferSheet onClose={() => setBooking(false)} />}
    </div>
  );
}