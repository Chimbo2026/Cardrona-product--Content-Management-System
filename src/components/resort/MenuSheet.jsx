import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import MenuDishRow from './MenuDishRow';
import FoodGuestForm from './FoodGuestForm';
import { CAFE_MENUS, formatNZD, generateFoodOrderNo } from '@/lib/foodMenu';
import { base44 } from '@/api/base44Client';
import { getEntrySource } from '@/lib/attribution';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function MenuSheet({ cafe, onClose }) {
  const { lang, bi } = useLanguage();
  const [step, setStep] = useState('menu');
  const [lines, setLines] = useState({});
  const [form, setForm] = useState({ guest_name: '', guest_phone: '', pickup_time: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const dishes = CAFE_MENUS[cafe.id] || [];
  const picked = dishes
    .map((dish) => ({ dish, qty: lines[dish.id]?.qty || 0, note: lines[dish.id]?.note || '' }))
    .filter((line) => line.qty > 0);
  const count = picked.reduce((sum, line) => sum + line.qty, 0);
  const total = picked.reduce((sum, line) => sum + line.dish.price * line.qty, 0);

  const setQty = (id, qty) =>
    setLines((prev) => ({ ...prev, [id]: { qty: Math.max(0, qty), note: prev[id]?.note || '' } }));
  const setNote = (id, note) =>
    setLines((prev) => ({ ...prev, [id]: { qty: prev[id]?.qty || 0, note } }));
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    if (!form.guest_name.trim()) {
      setError(bi('请填写取餐人姓名', 'Enter a name for the order'));
      return;
    }
    if (form.guest_phone.trim().length < 6) {
      setError(bi('请填写手机号', 'Enter a phone number'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const order = await base44.entities.FoodOrder.create({
        order_no: generateFoodOrderNo(),
        cafe_id: cafe.id,
        cafe_name: cafe.name.zh,
        items: picked.map((line) => ({
          dish_id: line.dish.id,
          name_zh: line.dish.name_zh,
          name_en: line.dish.name_en,
          qty: line.qty,
          unit_price: line.dish.price,
          amount: line.dish.price * line.qty,
          note: line.note,
        })),
        total_amount: total,
        currency: 'NZD',
        guest_name: form.guest_name.trim(),
        guest_phone: form.guest_phone.trim(),
        pickup_time: form.pickup_time.trim(),
        note: form.note.trim(),
        payment_method: 'pay_at_counter',
        payment_status: 'unpaid',
        status: 'pending',
        source: getEntrySource('小程序码'),
      });
      setDone(order);
      setStep('done');
    } catch {
      setError(bi('下单失败，请稍后重试', 'Could not place the order, please try again'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-[380px] overflow-y-auto">
        {step === 'done' ? (
          <div className="py-2 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <DialogTitle className="mt-3 text-[16px]">{bi('点单成功', 'Order placed')}</DialogTitle>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{done.order_no}</p>
            <div className="mt-4 space-y-1.5 rounded-xl bg-secondary/60 p-3 text-left text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{bi('餐厅', 'Café')}</span>
                <span>{cafe.name[lang] || cafe.name.zh}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{bi('取餐时间', 'Pick-up')}</span>
                <span>{done.pickup_time || bi('尽快', 'As soon as ready')}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>{bi('应付金额', 'Total')}</span>
                <span>{formatNZD(done.total_amount)}</span>
              </div>
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground">
              {bi(
                '请凭订单号到柜台付款取餐。',
                'Show this order number at the counter to pay and collect.',
              )}
            </p>
            <Button className="mt-4 h-10 w-full rounded-full" onClick={onClose}>
              {bi('完成', 'Done')}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[16px]">{cafe.name[lang] || cafe.name.zh}</DialogTitle>
              <DialogDescription className="text-[11px]">
                {step === 'menu'
                  ? bi('选择餐点，结算时可改份数与口味备注', 'Pick your dishes, edit quantities and taste notes at checkout')
                  : bi('核对份数并填写取餐信息', 'Check quantities and add pick-up details')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {picked.length === 0 && step === 'checkout' && (
                <p className="rounded-xl border border-dashed border-border py-6 text-center text-[11.5px] text-muted-foreground">
                  {bi('还没有选餐', 'No dishes selected yet')}
                </p>
              )}

              {(step === 'menu' ? dishes : picked.map((line) => line.dish)).map((dish) => (
                <MenuDishRow
                  key={dish.id}
                  dish={dish}
                  qty={lines[dish.id]?.qty || 0}
                  note={lines[dish.id]?.note || ''}
                  withNote={step === 'checkout'}
                  onQty={(qty) => setQty(dish.id, qty)}
                  onNote={(note) => setNote(dish.id, note)}
                />
              ))}
            </div>

            {step === 'checkout' && <FoodGuestForm form={form} update={update} />}

            {error && <p className="text-[11px] text-destructive">{error}</p>}

            <div className="flex items-center justify-between border-t border-dashed border-border pt-3 text-[12px]">
              <span className="text-muted-foreground">{bi(`已选 ${count} 件`, `${count} item${count === 1 ? '' : 's'}`)}</span>
              <span className="font-heading text-[18px] text-primary">{formatNZD(total)}</span>
            </div>

            {step === 'menu' ? (
              <Button
                className="h-11 w-full rounded-full"
                disabled={count === 0}
                onClick={() => setStep('checkout')}
              >
                {bi('去结算', 'Checkout')}
              </Button>
            ) : (
              <div className="space-y-1.5">
                <Button
                  className="h-11 w-full rounded-full"
                  disabled={submitting || count === 0}
                  onClick={submit}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : bi('提交点单', 'Place order')}
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 w-full rounded-full text-[11.5px]"
                  onClick={() => setStep('menu')}
                >
                  {bi('返回菜单继续加餐', 'Back to the menu')}
                </Button>
                <p className="text-center text-[10px] text-muted-foreground">
                  {bi('到柜台付款取餐，演示环境不会扣款', 'Pay at the counter; this demo charges nothing')}
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}