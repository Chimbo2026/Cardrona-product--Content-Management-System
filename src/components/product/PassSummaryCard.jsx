import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCNY } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PassSummaryCard({
  title,
  subtitle,
  price = 0,
  total = 0,
  deposit = 0,
  installments = 4,
  ready = false,
  hint = '',
  className = '',
  onAdd,
}) {
  const { bi } = useLanguage();

  return (
    <aside className={`rounded-xl border border-border bg-card p-4 shadow-sm ${className}`}>
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {bi('订单摘要', 'Item Summary')}
      </h2>

      {title ? (
        <>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-snug">{title}</p>
              {subtitle && <p className="mt-0.5 text-[10.5px] text-muted-foreground">{subtitle}</p>}
            </div>
            <span className="shrink-0 text-[12.5px]">
              {price === 0 ? bi('免费', 'Free') : formatCNY(price)}
            </span>
          </div>

          <div className="my-3 border-t border-border" />

          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12px] font-semibold">
              {deposit > 0 ? bi('今日应付', 'Due today') : bi('合计', 'Total')}
            </span>
            <span className="font-heading text-[18px] font-semibold text-primary">
              {total === 0 ? bi('免费', 'Free') : formatCNY(total)}
            </span>
          </div>

          {deposit > 0 && (
            <p className="mt-2 rounded-md bg-secondary px-2.5 py-1.5 text-[10px] leading-relaxed text-muted-foreground">
              {bi(
                `余款 ${formatCNY(Math.max(price - deposit, 0))} 分 ${installments} 期支付`,
                `Remaining ${formatCNY(Math.max(price - deposit, 0))} paid in ${installments} instalments`,
              )}
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground">{hint}</p>
      )}

      <Button
        type="button"
        className="mt-3 h-12 w-full rounded-md text-[13px] font-semibold"
        onClick={onAdd}
        disabled={!ready}
      >
        <ShoppingCart className="h-4 w-4" />
        {bi('加入购物车', 'Add to cart')}
      </Button>

      {!ready && hint && title && (
        <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground">{hint}</p>
      )}

      <p className="mt-2.5 text-center text-[9.5px] leading-relaxed text-muted-foreground">
        {bi('演示购物车，不会产生真实扣款。', 'Demonstration cart, no real charge is made.')}
      </p>
    </aside>
  );
}