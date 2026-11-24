import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import { useLang } from '@/lib/i18n';
import { NZD, num } from '@/lib/format';

const STOCK_OPS = [
  { value: 'set', label: ['设置为', 'Set to'] },
  { value: 'add', label: ['增加', 'Add'] },
  { value: 'remove', label: ['减少', 'Remove'] },
];

const PRICE_OPS = [
  { value: 'set', label: ['设置为 (NZD)', 'Set to (NZD)'] },
  { value: 'percent', label: ['按百分比调整', 'Adjust by %'] },
  { value: 'amount', label: ['按金额调整 (NZD)', 'Adjust by NZD'] },
];

const round2 = (n) => Math.round(n * 100) / 100;

export default function BulkUpdateDialog({ mode, products, open, onOpenChange, onSaved }) {
  const { t } = useLang();
  const { toast } = useToast();
  const isStock = mode === 'stock';
  const [op, setOp] = useState(isStock ? 'set' : 'percent');
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const ops = isStock ? STOCK_OPS : PRICE_OPS;

  const rows = useMemo(() => {
    const v = Number(value);
    if (!Number.isFinite(v) || value === '') return [];
    return products.map((p) => {
      if (isStock) {
        const prev = Number(p.stock_on_hand) || 0;
        const raw = op === 'set' ? v : op === 'add' ? prev + v : prev - v;
        return { id: p.id, name: p.name, prev, next: Math.max(0, Math.round(raw)) };
      }
      const prev = Number(p.price) || 0;
      const raw = op === 'set' ? v : op === 'percent' ? prev * (1 + v / 100) : prev + v;
      return { id: p.id, name: p.name, prev, next: round2(Math.max(0, raw)) };
    });
  }, [products, value, op, isStock]);

  const preview = rows.slice(0, 4);
  const totalStock = rows.reduce((s, r) => s + (r.next - r.prev), 0);

  const apply = async () => {
    if (!rows.length) return;
    setSaving(true);
    await base44.entities.RetailProduct.bulkUpdate(
      rows.map((r) => ({ id: r.id, [isStock ? 'stock_on_hand' : 'price']: r.next }))
    );
    toast({
      title: isStock ? t('库存已批量更新', 'Stock updated') : t('价格已批量更新', 'Pricing updated'),
      description: isStock
        ? t(`${rows.length} 件商品 · 库存变动 ${totalStock >= 0 ? '+' : ''}${num(totalStock)}`, `${rows.length} products · ${totalStock >= 0 ? '+' : ''}${num(totalStock)} units`)
        : t(`${rows.length} 件商品已更新售价`, `New price applied to ${rows.length} products`),
    });
    setSaving(false);
    setValue('');
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isStock ? t('批量调整库存', 'Bulk adjust stock') : t('批量调整价格', 'Bulk adjust pricing')}</DialogTitle>
          <DialogDescription>
            {t(`将对已选 ${products.length} 件商品生效，可先预览结果。`, `Applies to ${products.length} selected products — preview before saving.`)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('调整方式', 'Operation')}>
              <SelectNative
                value={op}
                onChange={setOp}
                options={ops.map((o) => ({ value: o.value, label: t(o.label[0], o.label[1]) }))}
                className="w-full"
              />
            </Field>
            <Field
              label={isStock ? t('数量', 'Units') : op === 'percent' ? t('百分比', 'Percent') : t('金额 (NZD)', 'Amount (NZD)')}
              required
            >
              <Input
                type="number"
                step={isStock || op === 'amount' ? '1' : '0.1'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={isStock ? '10' : op === 'percent' ? '-10' : '0'}
              />
            </Field>
          </div>

          {isStock && op === 'remove' && (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
              {t('库存不会低于 0。', 'Stock never drops below zero.')}
            </p>
          )}
          {!isStock && op === 'percent' && (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
              {t('使用负数下调价格，例如 -15 表示降价 15%。', 'Use a negative number to reduce prices, e.g. -15 for a 15% markdown.')}
            </p>
          )}

          {preview.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border/70">
              <p className="border-b border-border/70 bg-muted/40 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t('预览', 'Preview')}
              </p>
              <ul className="divide-y divide-border/60">
                {preview.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
                    <span className="line-clamp-1 text-[11.5px] text-forest-900">{r.name}</span>
                    <span className="num shrink-0 text-[11.5px] text-muted-foreground">
                      {isStock ? `${num(r.prev)} → ` : `${NZD(r.prev)} → `}
                      <span className="font-semibold text-forest-900">{isStock ? num(r.next) : NZD(r.next)}</span>
                    </span>
                  </li>
                ))}
                {rows.length > preview.length && (
                  <li className="px-3 py-1.5 text-[11px] text-muted-foreground">
                    {t(`另有 ${rows.length - preview.length} 件商品同步更新`, `${rows.length - preview.length} more products updated too`)}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>{t('取消', 'Cancel')}</Button>
          <Button onClick={apply} disabled={saving || !rows.length} className="gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('应用到已选商品', 'Apply to selected')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}