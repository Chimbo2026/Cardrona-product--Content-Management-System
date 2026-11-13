import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD } from '@/lib/format';
import { REFUND_FAILURE_REASONS, failRefund } from '@/lib/refunds';

export default function RefundFailureDialog({ refund, open, onOpenChange, onSaved }) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [reason, setReason] = useState('Refund window expired');
  const [detail, setDetail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReason('Refund window expired');
    setDetail('');
  }, [open]);

  if (!refund) return null;

  const submit = async () => {
    setSaving(true);
    await failRefund(refund, reason, detail);
    toast({
      title: t('退款失败已记录', 'Refund failure recorded'),
      description: `${refund.request_ref} · ${tx(reason, lang)}`,
      variant: 'destructive',
    });
    setSaving(false);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('记录退款失败', 'Record a failed refund')}</DialogTitle>
          <DialogDescription>
            {t('用于模拟支付渠道或发卡行拒绝退款，预订状态不受影响，款项仍需退还给宾客。', 'Simulates a provider or issuer decline. The booking is untouched — the guest is still owed the money.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
            <span className="text-[11.5px] text-muted-foreground">
              {refund.request_ref} · {refund.guest_name}
            </span>
            <span className="num text-[13px] font-semibold text-forest-900">{NZD(refund.amount)}</span>
          </div>

          <Field label={t('失败原因', 'Failure reason')} required>
            <SelectNative
              value={reason}
              onChange={setReason}
              options={REFUND_FAILURE_REASONS.map((r) => ({ value: r, label: tx(r, lang) }))}
              className="w-full"
            />
          </Field>

          <Field label={t('详情', 'Details')} hint={t('渠道返回的说明或人工记录', 'Provider message or a staff note')}>
            <Textarea rows={2} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={t('例如：原交易距今 187 天，超过 180 天退款时限', 'e.g. Original charge is 187 days old, past the 180-day window')} />
          </Field>

          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t('退款一经提交无法取消，失败后可选择门店消费额度、银行转账等人工补救方式。', 'A submitted refund cannot be cancelled. If it fails, staff choose a manual fallback such as store credit or a bank transfer.')}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>{t('取消', 'Cancel')}</Button>
          <Button variant="destructive" onClick={submit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('记录为失败', 'Mark as failed')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}