import { Banknote, CreditCard, Gift, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const METHODS = [
  {
    key: 'wechat_pay',
    Icon: Wallet,
    label: { zh: '微信支付', en: 'WeChat Pay' },
    note: { zh: '需绑定中国大陆银行卡', en: 'Mainland China card required' },
  },
  {
    key: 'gift_card',
    Icon: Gift,
    label: { zh: '礼物卡', en: 'Gift card' },
    note: { zh: '输入卡号与密码抵扣', en: 'Pay with a card number and PIN' },
  },
  {
    key: 'visa',
    Icon: CreditCard,
    label: { zh: 'Visa', en: 'Visa' },
    note: { zh: 'Visa 信用卡 / 借记卡', en: 'Visa credit or debit' },
  },
  {
    key: 'mastercard',
    Icon: CreditCard,
    label: { zh: 'Mastercard', en: 'Mastercard' },
    note: { zh: '万事达信用卡 / 借记卡', en: 'Mastercard credit or debit' },
  },
];

const WECHAT_CHANNELS = [
  {
    key: 'balance',
    Icon: Wallet,
    label: { zh: '零钱支付', en: 'Pay with balance' },
    note: { zh: '使用微信钱包余额', en: 'Use your WeChat wallet balance' },
  },
  {
    key: 'bank',
    Icon: Banknote,
    label: { zh: '银行卡支付', en: 'Pay from bank' },
    note: { zh: '需绑定中国大陆银行卡', en: 'Mainland China card required' },
  },
];

const onlyDigits = (value) => value.replace(/\D/g, '');

const formatCardNumber = (value) =>
  onlyDigits(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiry = (value) => {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export default function ShopPayment({ form, update }) {
  const { lang } = useLanguage();
  const bi = (zh, en) => (lang === 'en' ? en : zh);
  const isCard = form.payment_method === 'visa' || form.payment_method === 'mastercard';

  return (
    <div className="space-y-2">
      <Label className="text-[11px]">{bi('支付方式', 'Payment method')}</Label>
      <div className="grid grid-cols-2 gap-2">
        {METHODS.map(({ key, Icon, label, note }) => (
          <button
            key={key}
            type="button"
            onClick={() => update('payment_method', key)}
            className={`rounded-xl border px-2.5 py-2 text-left transition ${
              form.payment_method === key ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11.5px] font-medium">{bi(label.zh, label.en)}</span>
            </span>
            <span className="mt-0.5 block text-[9.5px] leading-snug text-muted-foreground">
              {bi(note.zh, note.en)}
            </span>
          </button>
        ))}
      </div>

      {form.payment_method === 'wechat_pay' && (
        <div className="space-y-2">
          <Label className="text-[11px]">{bi('扣款方式', 'Pay with')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {WECHAT_CHANNELS.map(({ key, Icon, label, note }) => (
              <button
                key={key}
                type="button"
                onClick={() => update('wechat_channel', key)}
                className={`rounded-xl border px-2.5 py-2 text-left transition ${
                  form.wechat_channel === key ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11.5px] font-medium">{bi(label.zh, label.en)}</span>
                </span>
                <span className="mt-0.5 block text-[9.5px] leading-snug text-muted-foreground">
                  {bi(note.zh, note.en)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {form.payment_method === 'gift_card' && (
        <div className="space-y-2 rounded-xl bg-secondary/50 p-2.5">
          <div className="space-y-1">
            <Label className="text-[11px]">{bi('礼物卡号', 'Gift card number')}</Label>
            <Input
              value={form.gift_code}
              onChange={(event) =>
                update('gift_code', event.target.value.toUpperCase().replace(/\s/g, ''))
              }
              placeholder="XXXX-XXXX-XXXX"
              className="h-9 font-mono text-[12px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">{bi('密码 / PIN', 'PIN')}</Label>
            <Input
              value={form.gift_pin}
              onChange={(event) => update('gift_pin', onlyDigits(event.target.value).slice(0, 6))}
              placeholder={bi('6 位数字', '6 digits')}
              inputMode="numeric"
              className="h-9 font-mono text-[12px]"
            />
          </div>
          <p className="text-[9.5px] leading-snug text-muted-foreground">
            {bi(
              '礼物卡可在门店或客服处购买，余额不足时差额改用其他方式支付。',
              'Gift cards are available in store or from support; any shortfall is paid another way.',
            )}
          </p>
        </div>
      )}

      {isCard && (
        <div className="space-y-2 rounded-xl bg-secondary/50 p-2.5">
          <div className="space-y-1">
            <Label className="text-[11px]">{bi('持卡人姓名', 'Cardholder name')}</Label>
            <Input
              value={form.card_name}
              onChange={(event) => update('card_name', event.target.value.toUpperCase())}
              placeholder="NAME ON CARD"
              className="h-9 text-[12px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">{bi('卡号', 'Card number')}</Label>
            <Input
              value={form.card_number}
              onChange={(event) => update('card_number', formatCardNumber(event.target.value))}
              placeholder={form.payment_method === 'visa' ? '4XXX XXXX XXXX XXXX' : '5XXX XXXX XXXX XXXX'}
              inputMode="numeric"
              className="h-9 font-mono text-[12px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px]">{bi('有效期', 'Expiry')}</Label>
              <Input
                value={form.card_expiry}
                onChange={(event) => update('card_expiry', formatExpiry(event.target.value))}
                placeholder="MM/YY"
                inputMode="numeric"
                className="h-9 font-mono text-[12px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">CVC</Label>
              <Input
                value={form.card_cvc}
                onChange={(event) => update('card_cvc', onlyDigits(event.target.value).slice(0, 4))}
                placeholder="123"
                inputMode="numeric"
                className="h-9 font-mono text-[12px]"
              />
            </div>
          </div>
          <p className="text-[9.5px] leading-snug text-muted-foreground">
            {bi(
              '演示环境：卡号仅用于本页校验，不会被保存。',
              'Demo build: the card number is checked on this page only and never stored.',
            )}
          </p>
        </div>
      )}
    </div>
  );
}