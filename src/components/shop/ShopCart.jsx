import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/lib/CartContext';
import { useAgent, withAgentDiscount } from '@/lib/AgentContext';
import { formatNZD } from '@/lib/shop';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ShopCart({ open, onOpenChange, onCheckout }) {
  const { lang, t, bi } = useLanguage();
  const { agent } = useAgent();
  const { cart, count, remove, setQty } = useCart();

  const total = cart.reduce(
    (sum, line) => sum + withAgentDiscount(line.item.price, agent) * line.qty,
    0,
  );

  return (
    <>
      {count > 0 && (
      <div className="sticky bottom-0 z-20 mt-3 border-t border-border bg-background/95 px-4 py-2.5 backdrop-blur">
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="flex w-full items-center gap-2.5 rounded-full bg-primary px-4 py-2.5 text-primary-foreground"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="text-[11.5px] font-medium">
            {t('shop.cart')} · {t('shop.count', { n: count })}
          </span>
          <span className="ml-auto text-[13px] font-semibold">{formatNZD(total)}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-[360px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[16px]">{t('shop.cart')}</DialogTitle>
            <DialogDescription className="text-[11px]">{t('shop.demoNote')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {count === 0 && (
              <p className="rounded-xl border border-dashed border-border py-6 text-center text-[11.5px] text-muted-foreground">
                {t('shop.empty')}
              </p>
            )}
            {cart.map((line) => (
              <div
                key={line.key}
                className="flex items-center gap-2.5 rounded-xl border border-border p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium">
                    {lang === 'en' ? line.item.name_en || line.item.name_zh : line.item.name_zh}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                    {line.size ? `${line.size} · ` : ''}
                    {formatNZD(withAgentDiscount(line.item.price, agent))}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQty(line.key, line.qty - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-[13px] leading-none text-muted-foreground"
                    aria-label={bi('减少数量', 'Decrease quantity')}
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-[11.5px]">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(line.key, line.qty + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-[13px] leading-none text-muted-foreground"
                    aria-label={bi('增加数量', 'Increase quantity')}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(line.key)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-destructive"
                  aria-label={bi('移除', 'Remove')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-border pt-3 text-[12px]">
            <span className="text-muted-foreground">
              {agent ? t('shop.agentPrice') : bi('合计', 'Total')}
            </span>
            <span className="font-heading text-[18px] text-primary">{formatNZD(total)}</span>
          </div>

          <Button
            type="button"
            className="h-11 w-full rounded-full"
            disabled={count === 0}
            onClick={onCheckout}
          >
            {t('shop.checkout')}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}