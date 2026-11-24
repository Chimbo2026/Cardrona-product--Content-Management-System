import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const SPINE = [
  { zh: '浏览首页', en: 'Browse' },
  { zh: '选择雪票', en: 'Choose a pass' },
  { zh: '预订并支付', en: 'Book & pay' },
  { zh: '订单取票', en: 'Ticket in Orders' },
];

const NOTES = [
  {
    label: { zh: '平行购买路径', en: 'Parallel paths' },
    items: { zh: '课程 · 租赁 · 餐饮住宿 · 商店', en: 'Lessons · Rentals · Food & stay · Shop' },
  },
  {
    label: { zh: '定价与库存', en: 'Pricing & inventory' },
    items: { zh: '代理与管理后台，叠加在全部流程之上', en: 'Agent & admin console layer over every flow' },
  },
];

export default function MapFlow() {
  const { bi } = useLanguage();

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-border bg-card p-3">
      <p className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {bi('主线流程', 'Main flow')}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        {SPINE.map((step, index) => (
          <span key={step.en} className="flex items-center gap-1">
            <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
              {bi(step.zh, step.en)}
            </span>
            {index < SPINE.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/60" />}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-1.5 border-t border-border pt-2.5">
        {NOTES.map((note) => (
          <div key={note.en} className="flex items-start gap-2 text-[10px] leading-snug">
            <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">
              {bi(note.label.zh, note.label.en)}
            </span>
            <span className="pt-0.5 text-foreground/75">{bi(note.items.zh, note.items.en)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}