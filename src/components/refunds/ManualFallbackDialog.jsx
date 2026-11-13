import { useEffect, useState } from 'react';
import { HandCoins, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD } from '@/lib/format';
import { MANUAL_RESOLUTIONS, escalateToManual } from '@/lib/refunds';

export default function ManualFallbackDialog({ refund, open, onOpenChange, onSaved }) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [resolution, setResolution] = useState('Store credit');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setResolution('Store credit');
    setNote('');
  }, [open]);

  if (!refund) return null;

  const submit = async () => {
    setSaving(true);
    await escalateToManual(refund, resolution, note, 'Refund desk');
    toast({
      title: t('已安排人工补救', 'Manual fallback set'),
      description: `${refund.request_ref} · ${tx(resolution, lang)}`,
    });
    setSaving(false);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('人工补救方案', 'Manual fallback')}</DialogTitle>
          <DialogDescription>
            {t('退款失败后款项不会自动退回，请选择替代方案并通知宾客。', 'A failed refund will not resend automatically — pick an alternative and let the guest know.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
            <p className="text-[11.5px] font-medium text-rose-800">
              {refund.request_ref} · {refund.guest_name} · {NZD(refund.amount)}
            </p>
            <p className="mt-0.5 text-[11px] text-rose-700">
              {t('失败原因：', 'Failed because: ')}
              {tx(refund.failure_reason, lang) || '—'}
            </p>
            {refund.failure_detail && <p className="mt-0.5 text-[10.5px] text-rose-700/80">{refund.failure_detail}</p>}
          </div>

          <Field label={t('补救方式', 'Fallback method')} required>
            <SelectNative
              value={resolution}
              onChange={setResolution}
              options={MANUAL_RESOLUTIONS.map((r) => ({ value: r, label: tx(r, lang) }))}
              className="w-full"
            />
          </Field>

          <Field label={t('处理备注', 'Staff note')} hint={t('宾客回复、转账凭证等', 'Guest reply, transfer reference, …')}>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('例如：已电话联系宾客，同意转为门店消费额度', 'e.g. Called the guest, agreed to store credit')} />
          </Field>

          <p className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            <HandCoins className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" />
            {t('保存后状态变为“待人工补救”，完成交付后在列表中标记已解决。', 'Saving sets the refund to “Manual required”. Mark it resolved once the alternative has been delivered.')}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>{t('取消', 'Cancel')}</Button>
          <Button onClick={submit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('保存补救方案', 'Save fallback')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}