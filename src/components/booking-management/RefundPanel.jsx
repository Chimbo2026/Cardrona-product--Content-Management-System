import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Loader2, Plus, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import RefundRequestDialog from '@/components/refunds/RefundRequestDialog';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, prettyDate } from '@/lib/format';

export default function RefundPanel({ booking, onSaved }) {
  const { lang, t } = useLang();
  const [refunds, setRefunds] = useState([]);
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState('');
  const { toast } = useToast();

  const load = useCallback(() => {
    base44.entities.RefundRequest.filter({ booking_id: booking.id }, { limit: 20 }).then((res) => {
      setRefunds(res?.items || (Array.isArray(res) ? res : []));
    });
  }, [booking.id]);

  useEffect(() => {
    load();
  }, [load]);

  const eligible =
    booking.booking_status !== 'Cancelled' && booking.payment_status !== 'Refunded' && booking.payment_status !== 'Pending';

  const handleSaved = () => {
    load();
    onSaved?.();
  };

  const refundViaStripe = async (refund) => {
    setWorking(refund.id);
    try {
      const res = await base44.functions.invoke('createStripeRefund', { refund_id: refund.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast({
        title: t('退款已提交至 Stripe', 'Refund sent to Stripe'),
        description:
          res.data?.status === 'Processed'
            ? t('退款已完成。', 'The refund is complete.')
            : t('微信支付退款为异步处理，Stripe 确认后自动更新。', 'WeChat Pay refunds confirm asynchronously and update automatically.'),
      });
      handleSaved();
    } catch (e) {
      toast({ title: t('退款提交失败', 'Refund failed'), description: e.message, variant: 'destructive' });
    } finally {
      setWorking('');
    }
  };

  return (
    <Panel
      title={t('退款', 'Refunds')}
      description={t('查看退款进度或提交新的退款申请。', 'Track existing refunds or request a new one.')}
      action={
        <Button size="sm" variant="outline" disabled={!eligible} onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {t('申请退款', 'Request refund')}
        </Button>
      }
    >
      {refunds.length === 0 ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-muted/25 px-3 py-2.5">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            {t('暂无退款申请。', 'No refund requests yet.')}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {refunds.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-forest-900">
                  {r.request_ref} · {NZD(r.amount)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {tx(r.reason, lang)} · {prettyDate(r.requested_at)}
                </p>
                {r.failure_reason && (
                  <p className="text-[10.5px] font-medium text-rose-700">
                    {t('退款失败：', 'Refund failed: ')}
                    {tx(r.failure_reason, lang)}
                    {r.resolution ? ` · ${t('补救：', 'Fallback: ')}${tx(r.resolution, lang)}` : ''}
                  </p>
                )}
              </div>
              <StatusBadge status={r.status} />
              {r.status === 'Approved' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 px-2 text-[11.5px]"
                  disabled={working === r.id}
                  onClick={() => refundViaStripe(r)}
                >
                  {working === r.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CreditCard className="h-3 w-3" />
                  )}
                  {t('通过 Stripe 退款', 'Refund via Stripe')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!eligible && (
        <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
          {booking.booking_status === 'Cancelled'
            ? t('该预订已取消，退款申请已结束。', 'This booking is cancelled, so no new refund can be requested.')
            : t('该预订当前状态不支持新的退款申请。', 'This booking is not eligible for a new refund request.')}
        </p>
      )}

      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
        {t(
          '退款将在审批通过后 5–10 个工作日退回原支付方式。',
          'Approved refunds return to the original payment method within 5–10 business days.'
        )}
      </p>

      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        {t(
          '微信支付退款须在原付款后 180 天内提交，且为异步处理——由 Stripe 回调确认最终状态。',
          'WeChat Pay refunds must be submitted within 180 days of payment and confirm asynchronously via Stripe webhook.'
        )}
      </p>

      <RefundRequestDialog open={open} onOpenChange={setOpen} bookings={[booking]} onSaved={handleSaved} />
    </Panel>
  );
}