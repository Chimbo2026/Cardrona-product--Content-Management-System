import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNZD } from '@/lib/booking';
import { localizedField } from '@/lib/i18n/localize';
import { useAgent, withAgentDiscount } from '@/lib/AgentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function RentalSummary({ item, date, onDateChange, onBook }) {
  const { lang, bi } = useLanguage();
  const { agent } = useAgent();
  const price = item ? withAgentDiscount(item.price, agent) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="text-[13px] font-semibold">{bi('订单摘要', 'Item Summary')}</h2>
      </div>

      <div className="space-y-3 px-4 py-3.5">
        <div>
          <label
            htmlFor="rental-date"
            className="block text-[11px] font-medium text-muted-foreground"
          >
            {bi('取用日期', 'Pick up date')}
          </label>
          <input
            id="rental-date"
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-[12.5px] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {item ? (
          <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
            <div className="min-w-0">
              <p className="text-[12px] font-medium leading-snug">
                (1) {localizedField(item, 'name', lang)}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">
                {localizedField(item, 'summary', lang)}
              </p>
              <Link
                to={`/product/${item.id}`}
                className="mt-1 inline-flex items-center gap-0.5 text-[10.5px] text-primary underline-offset-2 hover:underline"
              >
                {bi('查看租赁说明', 'View rental details')}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <span className="shrink-0 text-[12.5px] font-semibold">{formatNZD(price)}</span>
          </div>
        ) : (
          <p className="border-t border-border pt-3 text-[11.5px] text-muted-foreground">
            {bi('请先在上方表格中选择一项装备。', 'Select a rental item from the table above.')}
          </p>
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">{bi('总价', 'Total')}</span>
          <span className="text-[16px] font-semibold">{formatNZD(price)}</span>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {bi('价格按每人每天计算，多日租赁可在下一步选择。', 'Per person, per day. Add more days at the next step.')}
        </p>
        <Button
          type="button"
          disabled={!item || !date}
          onClick={onBook}
          className="mt-2.5 h-10 w-full rounded-lg text-[13px]"
        >
          {bi('立即预订', 'Book now')}
        </Button>
      </div>
    </div>
  );
}