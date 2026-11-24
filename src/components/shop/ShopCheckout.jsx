import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { useAgent, withAgentDiscount } from '@/lib/AgentContext';
import { getEntrySource } from '@/lib/attribution';
import { formatNZD, generateShopOrderNo } from '@/lib/shop';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { shippingLabel } from '@/lib/i18n/localize';
import ShopPayment from '@/components/shop/ShopPayment';

const SHIPPING = [
  {
    key: '顺丰国际直邮',
    label: { zh: '顺丰国际直邮（中国内地）', en: 'SF Express International (Mainland China)' },
    note: { zh: '7–12 个工作日 · 免运费', en: '7–12 business days · free shipping' },
    address: true,
  },
  {
    key: '新西兰酒店配送',
    label: { zh: '新西兰酒店配送', en: 'NZ hotel delivery' },
    note: { zh: '抵达当日送达 · 免运费', en: 'Delivered on your arrival day · free' },
    address: true,
  },
  {
    key: '门店自提',
    label: { zh: '皇后镇 / 瓦纳卡门店自提', en: 'Queenstown / Wanaka store pickup' },
    note: { zh: '营业时间内自提 · 免运费', en: 'Collect during opening hours · free' },
    address: false,
  },
];

const DEFAULT_FORM = {
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  shipping_method: '顺丰国际直邮',
  shipping_address: '',
  payment_method: 'wechat_pay',
  wechat_channel: 'balance',
  card_name: '',
  card_number: '',
  card_expiry: '',
  card_cvc: '',
  gift_code: '',
  gift_pin: '',
};

export default function ShopCheckout({ open, onOpenChange }) {
  const { lang, bi } = useLanguage();
  const { cart, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const { agent } = useAgent();
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const shipping = SHIPPING.find((item) => item.key === form.shipping_method) || SHIPPING[0];
  const subtotal = cart.reduce((sum, line) => sum + Number(line.item.price || 0) * line.qty, 0);
  const total = cart.reduce(
    (sum, line) => sum + withAgentDiscount(line.item.price, agent) * line.qty,
    0,
  );

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setDone(null);
    setError('');
    setSubmitting(false);
    setForm({ ...DEFAULT_FORM });
  };

  const close = (nextOpen) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const submit = async () => {
    setError('');
    if (!form.contact_name.trim() || !form.contact_phone.trim()) {
      setError(bi('请填写收件人姓名与手机号', 'Enter a recipient name and phone number'));
      return;
    }
    if (shipping.address && !form.shipping_address.trim()) {
      setError(bi('请填写收件地址', 'Enter a delivery address'));
      return;
    }
    if (form.payment_method === 'visa' || form.payment_method === 'mastercard') {
      if (!form.card_name.trim()) {
        setError(bi('请填写持卡人姓名', 'Enter the cardholder name'));
        return;
      }
      if (form.card_number.replace(/\D/g, '').length < 12) {
        setError(bi('请填写有效的卡号', 'Enter a valid card number'));
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(form.card_expiry)) {
        setError(bi('有效期格式为 MM/YY', 'Expiry must be MM/YY'));
        return;
      }
      if (form.card_cvc.length < 3) {
        setError(bi('请填写 CVC', 'Enter the CVC'));
        return;
      }
    }
    if (form.payment_method === 'gift_card' && form.gift_code.trim().length < 6) {
      setError(bi('请填写礼物卡号与密码', 'Enter your gift card number and PIN'));
      return;
    }
    setSubmitting(true);
    try {
      const order = await base44.entities.RetailOrder.create({
        order_no: generateShopOrderNo(),
        items: cart.map((line) => ({
          item_id: line.item.id,
          name_zh: line.item.name_zh,
          name_en: line.item.name_en || '',
          size: line.size,
          qty: line.qty,
          unit_price: withAgentDiscount(line.item.price, agent),
          amount: withAgentDiscount(line.item.price, agent) * line.qty,
        })),
        subtotal,
        discount_amount: subtotal - total,
        agent_code: agent?.code || '',
        agent_rate: agent?.rate || 0,
        total_amount: total,
        currency: 'NZD',
        shipping_method: form.shipping_method,
        contact_name: form.contact_name.trim(),
        contact_phone: form.contact_phone.trim(),
        contact_email: form.contact_email.trim(),
        shipping_address: shipping.address ? form.shipping_address.trim() : '门店自提',
        payment_method:
          form.payment_method === 'visa' || form.payment_method === 'mastercard'
            ? 'card'
            : form.payment_method,
        payment_status: 'paid',
        status: 'confirmed',
        source: getEntrySource('小程序码'),
      });
      clear();
      setDone(order);
    } catch {
      setError(bi('下单失败，请稍后重试', 'Could not place the order, please try again'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[85vh] max-w-[380px] overflow-y-auto">
        {done ? (
          <div className="py-2 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <DialogTitle className="mt-3 text-[16px]">
              {bi('下单成功', 'Order placed')}
            </DialogTitle>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{done.order_no}</p>
            <div className="mt-4 space-y-1.5 rounded-xl bg-secondary/60 p-3 text-left text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{bi('商品合计', 'Subtotal')}</span>
                <span>{formatNZD(subtotal)}</span>
              </div>
              {agent && (
                <div className="flex justify-between text-emerald-700">
                  <span>{bi(`代理折扣（-${agent.rate}%）`, `Agent discount (-${agent.rate}%)`)}</span>
                  <span>-{formatNZD(subtotal - total)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>{bi('应付金额', 'Total')}</span>
                <span>{formatNZD(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{bi('配送方式', 'Delivery')}</span>
                <span>{shippingLabel(done.shipping_method, lang)}</span>
              </div>
            </div>
            <p className="mt-3 text-[10.5px] text-muted-foreground">
              {bi(
                '演示环境：Shopify 订单未真实创建，不会扣款或发货。',
                'Demo build: no Shopify order is created, so nothing is charged or shipped.',
              )}
            </p>
            <div className="mt-4 space-y-2">
              <Button asChild className="h-10 w-full rounded-full">
                <Link to="/orders" onClick={() => close(false)}>
                  {isAuthenticated ? bi('查看我的订单', 'View my orders') : bi('登录后查看订单', 'Sign in to view orders')}
                </Link>
              </Button>
              <Button variant="ghost" className="h-9 w-full rounded-full" onClick={() => close(false)}>
                {bi('继续购物', 'Keep shopping')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[16px]">{bi('结算', 'Checkout')}</DialogTitle>
              <DialogDescription className="text-[11px]">
                {bi(
                  `共 ${cart.length} 种商品 · 合计 ${formatNZD(total)}`,
                  `${cart.length} item${cart.length === 1 ? '' : 's'} · ${formatNZD(total)} total`,
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px]">{bi('收件人', 'Recipient')}</Label>
                  <Input
                    value={form.contact_name}
                    onChange={(event) => update('contact_name', event.target.value)}
                    placeholder={bi('与证件一致', 'As shown on your ID')}
                    className="h-9 text-[12px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">{bi('手机号', 'Phone')}</Label>
                  <Input
                    value={form.contact_phone}
                    onChange={(event) => update('contact_phone', event.target.value)}
                    placeholder="+86"
                    className="h-9 text-[12px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">{bi('邮箱（可选）', 'Email (optional)')}</Label>
                <Input
                  value={form.contact_email}
                  onChange={(event) => update('contact_email', event.target.value)}
                  placeholder={bi('用于接收电子小票', 'For your e-receipt')}
                  className="h-9 text-[12px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">{bi('配送方式', 'Delivery method')}</Label>
                {SHIPPING.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => update('shipping_method', option.key)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      form.shipping_method === option.key
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <p className="text-[12px] font-medium">{option.label[lang === 'en' ? 'en' : 'zh']}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {option.note[lang === 'en' ? 'en' : 'zh']}
                    </p>
                  </button>
                ))}
              </div>

              {shipping.address && (
                <div className="space-y-1">
                  <Label className="text-[11px]">
                    {shipping.key === '新西兰酒店配送'
                      ? bi('酒店名称与入住日期', 'Hotel name and check-in date')
                      : bi('收件地址', 'Delivery address')}
                  </Label>
                  <Input
                    value={form.shipping_address}
                    onChange={(event) => update('shipping_address', event.target.value)}
                    placeholder={
                      shipping.key === '新西兰酒店配送'
                        ? bi('例如：Queenstown Hilton，10 月 30 日入住', 'e.g. Queenstown Hilton, checking in 30 Oct')
                        : bi('省 / 市 / 区 / 详细地址', 'Province / city / district / street address')
                    }
                    className="h-9 text-[12px]"
                  />
                </div>
              )}

              <ShopPayment form={form} update={update} />

              {error && <p className="text-[11px] text-destructive">{error}</p>}

              <Button
                className="h-11 w-full rounded-full"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  bi(`支付 ${formatNZD(total)}`, `Pay ${formatNZD(total)}`)
                )}
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                {bi('演示环境：不会真实扣款', 'Demo build: nothing is really charged')}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}