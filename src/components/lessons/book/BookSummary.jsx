import { Button } from '@/components/ui/button';
import { formatNZD } from '@/lib/shop';
import { AGE_GROUPS, SESSIONS, lessonName } from '@/lib/lessonBooking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BookSummary({ typeId, age, level, session, date, price, onBook, variant = 'card' }) {
  const { lang, bi } = useLanguage();
  const ageLabel = AGE_GROUPS.find((item) => item.id === age);
  const sessionItem = SESSIONS.find((item) => item.id === session);
  const title = `(1) ${lessonName(typeId, lang)} - ${lang === 'en' ? ageLabel?.en : ageLabel?.zh} - ${
    lang === 'en' ? sessionItem?.short_en : sessionItem?.short_zh
  }`;
  const dateLabel = date
    ? new Date(date).toLocaleDateString(lang === 'en' ? 'en-NZ' : 'zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : bi('待选择', 'Not set');

  if (variant === 'bar') {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate text-[11px] text-muted-foreground">{title}</p>
          <span className="font-heading text-[18px] font-semibold text-primary">{formatNZD(price)}</span>
        </div>
        <Button type="button" className="h-11 w-full rounded-full text-[13px] font-semibold" onClick={onBook}>
          {bi('立即预订', 'Book Now')}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
        {bi('订单摘要', 'Item summary')}
      </p>
      <h3 className="mt-1.5 text-[13.5px] font-semibold leading-snug">{title}</h3>

      <dl className="mt-3 space-y-1.5 text-[11.5px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{bi('日期', 'Date')}</dt>
          <dd className="text-right font-medium">{dateLabel}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{bi('水平', 'Level')}</dt>
          <dd className="text-right font-medium">
            {lang === 'en'
              ? { first_timer: 'First Timer', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[level]
              : { first_timer: '初次上雪', beginner: '初级', intermediate: '中级', advanced: '高级' }[level]}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-border pt-3">
        <span className="text-[11.5px] text-muted-foreground">{bi('总价', 'Total')}</span>
        <span className="font-heading text-[22px] font-semibold text-primary">{formatNZD(price)}</span>
      </div>

      <Button type="button" className="mt-3 h-12 w-full rounded-full text-[13.5px] font-semibold" onClick={onBook}>
        {bi('立即预订', 'Book Now')}
      </Button>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        {bi('价格为每人每节课，含教练与装备指导', 'Per person, per session, coaching included')}
      </p>
    </div>
  );
}