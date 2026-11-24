import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Field from '@/components/common/Field';
import { useToast } from '@/components/ui/use-toast';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';

export default function ProductStockDialog({ product, open, onOpenChange, onSaved }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!product) return;
    setForm({
      price: product.price ?? 0,
      compare_at_price: product.compare_at_price ?? '',
      cost_price: product.cost_price ?? '',
      stock_on_hand: product.stock_on_hand ?? 0,
      reorder_level: product.reorder_level ?? 5,
      notes: product.notes || '',
    });
  }, [product]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    await base44.entities.RetailProduct.update(product.id, {
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price === '' ? null : Number(form.compare_at_price),
      cost_price: form.cost_price === '' ? null : Number(form.cost_price),
      stock_on_hand: Number(form.stock_on_hand) || 0,
      reorder_level: Number(form.reorder_level) || 0,
      notes: form.notes,
    });
    toast({ title: t('商品已更新', 'Product updated'), description: product.name });
    setSaving(false);
    onOpenChange(false);
    onSaved();
  };

  const margin =
    Number(form.price) > 0 && Number(form.cost_price) > 0
      ? (((Number(form.price) - Number(form.cost_price)) / Number(form.price)) * 100).toFixed(1)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('库存与定价', 'Stock & pricing')}</DialogTitle>
          <DialogDescription>{product?.name}</DialogDescription>
        </DialogHeader>

        {product && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('售价 (NZD)', 'Retail price (NZD)')} required>
                <Input type="number" min="0" step="0.01" value={form.price ?? ''} onChange={set('price')} />
              </Field>
              <Field label={t('原价 (NZD)', 'Compare-at (NZD)')}>
                <Input type="number" min="0" step="0.01" value={form.compare_at_price ?? ''} onChange={set('compare_at_price')} placeholder="—" />
              </Field>
              <Field label={t('成本价 (NZD)', 'Cost price (NZD)')} hint={margin ? t(`毛利率 ${margin}%`, `Margin ${margin}%`) : undefined}>
                <Input type="number" min="0" step="0.01" value={form.cost_price ?? ''} onChange={set('cost_price')} placeholder="—" />
              </Field>
              <Field label={t('补货点', 'Reorder level')}>
                <Input type="number" min="0" value={form.reorder_level ?? ''} onChange={set('reorder_level')} />
              </Field>
            </div>
            <Field label={t('在架库存', 'Units on hand')} required>
              <Input type="number" min="0" value={form.stock_on_hand ?? ''} onChange={set('stock_on_hand')} />
            </Field>
            <Field label={t('备注', 'Notes')}>
              <Input value={form.notes} onChange={set('notes')} placeholder={t('例如：下周二补货', 'e.g. restock arriving Tuesday')} />
            </Field>
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
              {t(
                `当前库存零售价值 ${NZD((Number(form.stock_on_hand) || 0) * (Number(form.price) || 0))}`,
                `Stock value at retail ${NZD((Number(form.stock_on_hand) || 0) * (Number(form.price) || 0))}`
              )}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('取消', 'Cancel')}</Button>
          <Button onClick={save} disabled={saving}>{saving ? t('保存中…', 'Saving…') : t('保存', 'Save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}