import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNZD } from '@/lib/booking';
import { localizedField } from '@/lib/i18n/localize';
import { useAgent, withAgentDiscount } from '@/lib/AgentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LessonSummary({ lesson, date, onDateChange, onBook }) {
  const { lang, bi } = useLanguage();
  const { agent } = useAgent();
  const price = lesson ? withAgentDiscount(lesson.price, agent) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="text-[13px] font-semibold">{bi('订单摘要', 'Item Summary')}</h2>
      </div>

      <div className="space-y-3 px-4 py-3.5">
        <div>
          <label
            htmlFor="lesson-date"
            className="block text-[11px] font-medium text-muted-foreground"
          >
            {bi('开始日期', 'Start date')}
          </label>
          <input
            id="lesson-date"
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-[12.5px] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {lesson ? (
          <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
            <div className="min-w-0">
              <p className="text-[12px] font-medium leading-snug">
                {bi('(1) ', '(1) ')}
                {localizedField(lesson, 'name', lang)}
              </p>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                {localizedField(lesson, 'duration', lang)}
              </p>
              <Link
                to={`/product/${lesson.id}`}
                className="mt-1 inline-flex items-center gap-0.5 text-[10.5px] text-primary underline-offset-2 hover:underline"
              >
                {bi('查看课程详情', 'View lesson details')}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <span className="shrink-0 text-[12.5px] font-semibold">{formatNZD(price)}</span>
          </div>
        ) : (
          <p className="border-t border-border pt-3 text-[11.5px] text-muted-foreground">
            {bi('请先在上方表格中选择一门课程。', 'Select a lesson from the table above.')}
          </p>
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">{bi('总价', 'Total')}</span>
          <span className="text-[16px] font-semibold">{formatNZD(price)}</span>
        </div>
        <Button
          type="button"
          disabled={!lesson || !date}
          onClick={onBook}
          className="mt-3 h-10 w-full rounded-lg text-[13px]"
        >
          {bi('立即预订', 'Book now')}
        </Button>
      </div>
    </div>
  );
}