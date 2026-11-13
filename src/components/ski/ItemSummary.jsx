import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';
import { DEPOSIT_NZD, ageLabel, shortPassName } from '@/lib/seasonPasses';

export default function ItemSummary({ passType, age, plan, price, canAdd, onAdd, blockedReason }) {
  const { t } = useLang();
  const payLater = plan === 'Buy Now, Pay Later';

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {t('订单摘要', 'Item summary')}
      </p>

      <div className="mt-3 border-b border-border/80 pb-3">
        <p className="text-[13px] font-medium text-forest-900">
          (1) {shortPassName(passType)} - {ageLabel(age)}
        </p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">{t(plan === 'Pay Now' ? '立即支付' : '先买后付', plan)}</p>
        <p className="num mt-1.5 text-[15px] font-semibold text-forest-950">{NZD(price)}</p>
        {payLater && price > 0 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t(`今日支付 ${NZD(DEPOSIT_NZD)} 定金`, `${NZD(DEPOSIT_NZD)} deposit due today`)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between py-3">
        <span className="text-[13px] font-semibold text-forest-900">{t('合计', 'Total')}</span>
        <span className="num text-[16px] font-semibold text-forest-950">{NZD(price)}</span>
      </div>

      <Button className="w-full gap-1.5" disabled={!canAdd} onClick={onAdd}>
        <ShoppingCart className="h-3.5 w-3.5" /> {t('加入购物车', 'Add to cart')}
      </Button>

      {!canAdd && blockedReason && (
        <p className="mt-2 text-[11px] text-destructive">{blockedReason}</p>
      )}
      <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
        {t('演示购物车，不会触发真实扣款。', 'Demonstration cart — no real charge is made.')}
      </p>
    </div>
  );
}