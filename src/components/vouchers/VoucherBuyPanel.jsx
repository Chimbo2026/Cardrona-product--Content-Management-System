import { useState } from 'react';
import { Gift, Loader2, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/lib/i18n';
import { NZD, prettyDate } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';
import VoucherCard from '@/components/vouchers/VoucherCard';
import { sellGiftVoucher, nextYearISO, VOUCHER_PRESETS } from '@/lib/giftVouchers';

const DELIVERY = [
  { value: 'WeChat', zh: '微信发送', en: 'Send via WeChat', icon: MessageCircle },
  { value: 'Email', zh: '邮件发送', en: 'Send via email', icon: Mail },
];

export default function VoucherBuyPanel({ onSold }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [amount, setAmount] = useState(500);
  const [purchaser, setPurchaser] = useState('');
  const [recipient, setRecipient] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [delivery, setDelivery] = useState('WeChat');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [issued, setIssued] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (!purchaser.trim()) return setError(t('请填写购买人姓名。', 'Enter the purchaser name.'));
    if (!recipient.trim()) return setError(t('请填写接收人姓名。', 'Enter the recipient name.'));
    if (!(Number(amount) > 0)) return setError(t('请选择或输入礼品卡面值。', 'Choose or enter a voucher amount.'));

    setBusy(true);
    try {
      const res = await sellGiftVoucher({
        purchaserName: purchaser.trim(),
        recipientName: recipient.trim(),
        email: email.trim(),
        message: message.trim(),
        amount: Number(amount),
        currency: 'NZD',
        expiresAt: nextYearISO(),
        recipientChannel: delivery,
      });
      setIssued(res.voucher);
      toast({
        title: t('购买成功', 'Purchase complete'),
        description:
          delivery === 'WeChat'
            ? t('购买成功，已发送至对方微信', 'Purchase successful — sent to their WeChat')
            : t('购买成功，已发送至对方邮箱', 'Purchase successful — sent to their email'),
      });
      onSold?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setIssued(null);
    setPurchaser('');
    setRecipient('');
    setEmail('');
    setMessage('');
    setAmount(500);
  };

  if (issued) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            {issued.recipient_channel === 'WeChat'
              ? t('购买成功，已发送至对方微信', 'Purchase successful — sent to their WeChat')
              : t('购买成功，已发送至对方邮箱', 'Purchase successful — sent to their email')}
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-emerald-900/80">
            {t(
              `兑换码 ${issued.code}（${NZD(Number(issued.amount))}），接收人 ${issued.recipient_name}。对方可在礼品卡页面输入兑换码，抵扣缆车票、课程或租赁订单。`,
              `Code ${issued.code} (${NZD(Number(issued.amount))}) for ${issued.recipient_name}. They can enter it on the gift voucher page to pay for lift passes, lessons or rentals.`
            )}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[11.5px] text-emerald-900/80">
            <div>
              <dt className="text-emerald-700/70">{t('有效期至', 'Valid until')}</dt>
              <dd className="font-medium">{prettyDate(issued.expires_at)}</dd>
            </div>
            <div>
              <dt className="text-emerald-700/70">{t('销售单号', 'Sale reference')}</dt>
              <dd className="num font-medium">{issued.sold_on_ref}</dd>
            </div>
          </dl>
          <Button className="mt-4" size="sm" variant="outline" onClick={reset}>
            {t('再购买一张', 'Buy another voucher')}
          </Button>
        </div>
        <VoucherCard voucher={issued} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div className="rounded-xl border border-border/80 bg-card p-4">
        <p className="text-[13px] font-semibold text-forest-900">{t('礼品卡面值', 'Voucher amount')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {VOUCHER_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              className={`num rounded-lg border px-4 py-2 text-[13px] font-semibold transition ${
                Number(amount) === value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-white text-forest-900 hover:border-primary/40'
              }`}
            >
              {NZD(value)}
            </button>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-muted-foreground">{t('自定义', 'Custom')}</span>
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9 w-28"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11.5px] font-medium text-forest-900">{t('购买人姓名', 'Purchaser name')}</span>
            <Input value={purchaser} onChange={(e) => setPurchaser(e.target.value)} className="mt-1 h-9" />
          </label>
          <label className="block">
            <span className="text-[11.5px] font-medium text-forest-900">{t('接收人姓名', 'Recipient name')}</span>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-1 h-9" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11.5px] font-medium text-forest-900">{t('接收人邮箱（可选）', 'Recipient email (optional)')}</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-9" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11.5px] font-medium text-forest-900">{t('赠言', 'Gift message')}</span>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={t('例如：生日快乐！雪场见 🎿', 'e.g. Happy birthday — see you on the mountain!')}
              className="mt-1"
            />
          </label>
        </div>

        <p className="mt-4 text-[11.5px] font-medium text-forest-900">{t('发送方式', 'Delivery')}</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {DELIVERY.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDelivery(option.value)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
                delivery === option.value
                  ? 'border-primary bg-ice-50 text-primary'
                  : 'border-border bg-white text-muted-foreground hover:border-primary/40'
              }`}
            >
              <option.icon className="h-3.5 w-3.5" />
              {t(option.zh, option.en)}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11.5px] font-medium text-rose-700">{error}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
          <p className="text-[11.5px] text-muted-foreground">
            {t('演示环境：付款为模拟流程，不会产生真实扣款。', 'Demo: payment is simulated and no real charge is made.')}
          </p>
          <Button type="submit" disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gift className="h-3.5 w-3.5" />}
            {t('立即购买', 'Buy now')} · {NZD(Number(amount) || 0)}
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t('卡面预览', 'Card preview')}
        </p>
        <VoucherCard
          voucher={{
            code: 'GV-000000',
            amount: Number(amount) || 0,
            balance: Number(amount) || 0,
            status: 'Active',
            recipient_name: recipient || t('接收人姓名', 'Recipient name'),
            purchaser_name: purchaser,
            message,
            expires_at: nextYearISO(),
          }}
        />
      </div>
    </form>
  );
}