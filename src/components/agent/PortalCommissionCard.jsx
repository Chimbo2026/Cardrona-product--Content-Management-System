import { useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatNZD } from '@/lib/shop';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PortalCommissionCard({
  commission,
  claimable,
  revenue,
  orderCount,
  rate,
  onClaim,
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);

  const canClaim = claimable > 0 && !claiming;

  const submit = async () => {
    if (!canClaim) return;
    setClaiming(true);
    try {
      await onClaim();
      toast({ title: t('portal.claimed') });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {t('portal.commission')}
      </p>
      <p className="mt-1 font-heading text-[30px] leading-none">{formatNZD(commission)}</p>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-dashed border-border pt-2.5 text-center">
        <div>
          <p className="text-[9.5px] text-muted-foreground">{t('portal.revenue')}</p>
          <p className="mt-0.5 text-[11.5px] font-medium">{formatNZD(revenue)}</p>
        </div>
        <div>
          <p className="text-[9.5px] text-muted-foreground">{t('portal.orders')}</p>
          <p className="mt-0.5 text-[11.5px] font-medium">{orderCount}</p>
        </div>
        <div>
          <p className="text-[9.5px] text-muted-foreground">{t('portal.rate')}</p>
          <p className="mt-0.5 text-[11.5px] font-medium">{rate}%</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
        <span className="text-[11px] text-muted-foreground">{t('portal.claimable')}</span>
        <span className="font-heading text-[15px]">{formatNZD(claimable)}</span>
      </div>

      <Button
        className="mt-2.5 h-10 w-full rounded-full"
        onClick={submit}
        disabled={!canClaim}
      >
        {claiming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t('portal.claiming')}
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" /> {t('portal.claim')}
          </>
        )}
      </Button>

      {claimable <= 0 && (
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          {t('portal.nothing')}
        </p>
      )}
    </section>
  );
}