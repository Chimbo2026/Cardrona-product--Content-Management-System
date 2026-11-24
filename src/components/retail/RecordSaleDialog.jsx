import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import { useToast } from '@/components/ui/use-toast';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';

const CHANNELS = ['In store', 'Click & collect', 'Online'];
const METHODS = ['Card', 'Cash', 'WeChat Pay', 'Alipay', 'Gift Voucher'];

export default function RecordSaleDialog({ product, products, open, onOpenChange, onSaved }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initial = product || products[0];
    if (!initial) return;
    setForm({
      product_id: initial.id,
      quantity: 1,
      unit_price: initial.price ?? 0,
      channel: 'In store',
      payment_method: 'Card',
      guest_name: '',
      note: '',
    });
  }, [open, product, products]);

  if (!form) return null;

  const selected = products.find((p) => p.id === form.product_id);
  const qty = Number(form.quantity) || 0;
  const total = qty * (Number(form.unit_price) || 0);
  const shortStock = selected && qty > (Number(selected.stock_on_hand) || 0);

  const chooseProduct = (id) => {
    const next = products.find((p) => p.id === id);
    setForm((f) => ({ ...f, product_id: id, unit_price: next?.price ?? f.unit_price }));
  };

  const save = async () => {
    if (!selected || qty <= 0) return;
    setSaving(true);
    await base44.entities.RetailSale.create({
      product_id: selected.id,
      product_name: selected.name,
      sku: selected.sku,
      vendor: selected.vendor,
      category: selected.category,
      quantity: qty,
      unit_price: Number(form.unit_price) || 0,
      total,
      currency: 'NZD',
      sold_at: new Date().toISOString(),
      channel: form.channel,
      payment_method: form.payment_method,
      guest_name: form.guest_name,
      sold_by: 'Retail desk',
      note: form.note,
    });
    await base44.entities.RetailProduct.update(selected.id, {
      stock_on_hand: Math.max(0, (Number(selected.stock_on_hand) || 0) - qty),
    });
    toast({ title: t('销售已记录', 'Sale recorded'), description: `${selected.name} · ${NZD(total)}` });
    setSaving(false);
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('记录零售销售', 'Record retail sale')}</DialogTitle>
          <DialogDescription>
            {t('保存后将从在架库存中扣减，并立即计入销售报告。', 'Saving deducts the units from stock and updates the sales report instantly.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Field label={t('商品', 'Product')} required>
            <SelectNative
              value={form.product_id}
              onChange={chooseProduct}
              options={products.map((p) => ({ value: p.id, label: `${p.name} · ${NZD(p.price)}` }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('数量', 'Quantity')} required>
              <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
            </Field>
            <Field label={t('单价 (NZD)', 'Unit price (NZD)')} required>
              <Input type="number" min="0" step="0.01" value={form.unit_price} onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))} />
            </Field>
            <Field label={t('渠道', 'Channel')}>
              <SelectNative value={form.channel} onChange={(v) => setForm((f) => ({ ...f, channel: v }))} options={CHANNELS} />
            </Field>
            <Field label={t('支付方式', 'Payment')}>
              <SelectNative value={form.payment_method} onChange={(v) => setForm((f) => ({ ...f, payment_method: v }))} options={METHODS} />
            </Field>
          </div>
          <Field label={t('宾客姓名（可选）', 'Guest name (optional)')}>
            <Input value={form.guest_name} onChange={(e) => setForm((f) => ({ ...f, guest_name: e.target.value }))} placeholder={t('例如：Emma Whitcombe', 'e.g. Emma Whitcombe')} />
          </Field>
          <Field label={t('备注', 'Note')}>
            <Input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder={t('尺码、换货等…', 'Size, exchange, …')} />
          </Field>

          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
            <span className="text-[11.5px] text-muted-foreground">{t('销售合计', 'Sale total')}</span>
            <span className="num text-[15px] font-semibold text-forest-900">{NZD(total)}</span>
          </div>
          {shortStock && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              {t(`在架仅 ${selected.stock_on_hand} 件，库存将归零。`, `Only ${selected.stock_on_hand} on hand — stock will be zeroed out.`)}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('取消', 'Cancel')}</Button>
          <Button onClick={save} disabled={saving || !selected || qty <= 0}>
            {saving ? t('保存中…', 'Saving…') : t('记录销售', 'Record sale')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}