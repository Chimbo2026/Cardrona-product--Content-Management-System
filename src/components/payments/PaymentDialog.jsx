import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, ExternalLink, Loader2, QrCode, Smartphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { SelectNative } from '@/components/common/Controls';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';
import { PAYMENT_CURRENCIES, WECHAT_CURRENCY, convertFromNzd, currencyForCountry, money } from '@/lib/currency';
import { cn } from '@/lib/utils';

export default function PaymentDialog({ open, onOpenChange, booking, onPaid, amountNzd }) {
  const { toast } = useToast();
  const { t } = useLang();
  const [currency, setCurrency] = useState('NZD');
  const [method, setMethod] = useState('card');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);

  // The guest's region decides the opening currency (and WeChat Pay for mainland China).
  const cardCurrencyCodes = PAYMENT_CURRENCIES.filter((c) => c.code !== WECHAT_CURRENCY).map((c) => c.code);
  const regionCurrency = currencyForCountry(booking?.guest_country);
  const prefersWechat = regionCurrency === WECHAT_CURRENCY;
  const defaultCurrency = cardCurrencyCodes.includes(booking?.currency)
    ? booking.currency
    : cardCurrencyCodes.includes(regionCurrency)
      ? regionCurrency
      : 'NZD';

  useEffect(() => {
    if (!open) return;
    setCurrency(prefersWechat ? WECHAT_CURRENCY : defaultCurrency);
    setMethod(prefersWechat ? 'wechat' : 'card');
    setError('');
    setSession(null);
    setBusy(false);
  }, [open]);

  // While the WeChat QR is on screen, watch the payment record for the webhook confirmation.
  useEffect(() => {
    if (!open || !session?.payment_id) return undefined;
    const timer = setInterval(async () => {
      const record = await base44.entities.StripePayment.get(session.payment_id).catch(() => null);
      if (record?.status !== 'Paid') return;
      clearInterval(timer);
      toast({
        title: t('支付成功', 'Payment received'),
        description: `${booking.booking_ref} · ${money(record.amount, record.currency)}`,
      });
      onPaid?.();
      onOpenChange(false);
    }, 4000);
    return () => clearInterval(timer);
  }, [open, session]);

  if (!booking) return null;

  // Charge the outstanding balance when the booking already carries gift voucher credit.
  const totalNzd =
    amountNzd !== undefined
      ? Number(amountNzd) || 0
      : (Number(booking.amount) || 0) * (Number(booking.guests_count) || 1);
  const currencies = PAYMENT_CURRENCIES.filter((c) => c.code !== WECHAT_CURRENCY);

  const pickMethod = (next) => {
    setMethod(next);
    setError('');
    setCurrency(next === 'wechat' ? WECHAT_CURRENCY : 'NZD');
  };

  const start = async () => {
    if (busy) return;
    setError('');
    const framed = window.self !== window.top;
    const tab = framed && method === 'card' ? window.open('', '_blank') : null;
    if (framed && method === 'card' && !tab) {
      setError(t('请允许弹出窗口以继续支付。', 'Allow pop-ups to continue to checkout.'));
      return;
    }
    if (tab) tab.opener = null;

    setBusy(true);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', {
        booking_id: booking.id,
        currency,
        method,
      });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.url) throw new Error(t('无法创建支付会话。', 'Could not start the checkout session.'));

      if (method === 'wechat') {
        setSession(data);
      } else if (tab) {
        tab.location.replace(data.url);
      } else {
        window.location.assign(data.url);
      }
    } catch (e) {
      tab?.close();
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('Stripe 收款', 'Stripe payment')}</DialogTitle>
          <DialogDescription>
            {t('通过 Stripe 托管结账页面收款，支持银行卡与微信支付。', 'Charge through the Stripe hosted checkout page with cards or WeChat Pay.')}
          </DialogDescription>
        </DialogHeader>

        {session ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-5 text-center">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <QRCodeSVG value={session.url} size={188} level="M" />
            </div>
            <p className="text-[12.5px] font-medium text-forest-900">
              {t('请用微信扫一扫完成支付', 'Scan with WeChat to complete the payment')}
            </p>
            <p className="num text-[15px] font-semibold text-forest-950">{money(session.amount, session.currency)}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t('等待 Stripe 确认付款，完成后将自动更新预订。', 'Waiting for Stripe to confirm — the booking updates automatically.')}
            </p>
            <a
              href={session.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-forest-700 hover:text-forest-900"
            >
              <ExternalLink className="h-3 w-3" /> {t('在托管页打开', 'Open the hosted page')}
            </a>
          </div>
        ) : (
          <>
            <div>
              <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t('支付方式', 'Payment method')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: 'card', icon: CreditCard, zh: '银行卡', en: 'Card', hintZh: 'Visa / Mastercard', hintEn: 'Visa / Mastercard' },
                  { id: 'wechat', icon: Smartphone, zh: '微信支付', en: 'WeChat Pay', hintZh: '扫码支付（中国大陆）', hintEn: 'QR payment' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => pickMethod(option.id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      method === option.id
                        ? 'border-forest-600 bg-forest-50 text-forest-900'
                        : 'border-border bg-card hover:border-forest-300'
                    )}
                  >
                    <option.icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-semibold">{t(option.zh, option.en)}</span>
                      <span className="block text-[10.5px] text-muted-foreground">{t(option.hintZh, option.hintEn)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {t('结账货币', 'Checkout currency')}
                </span>
                {method === 'wechat' ? (
                  <p className="text-[13px] font-medium text-forest-900">CNY · {t('人民币', 'Chinese yuan')}</p>
                ) : (
                  <SelectNative
                    value={currency}
                    onChange={setCurrency}
                    options={currencies.map((c) => ({ value: c.code, label: `${c.code} · ${t(c.zh, c.en)}` }))}
                    className="w-full"
                  />
                )}
              </div>
              <div>
                <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {t('应付金额', 'Amount due')}
                </span>
                <p className="num text-[17px] font-semibold text-forest-950">{money(convertFromNzd(totalNzd, currency), currency)}</p>
                <p className="num text-[11px] text-muted-foreground">
                  {t('预订总额', 'Booking total')} {NZD((Number(booking.amount) || 0) * (Number(booking.guests_count) || 1))}
                </p>
              </div>
            </div>

            {method === 'wechat' && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11.5px] leading-relaxed text-amber-800">
                {t(
                  '微信支付以人民币（CNY）结算，金额按当前汇率换算；扫码后由 Stripe 确认到账。',
                  'WeChat Pay settles in CNY at the current rate; Stripe confirms the payment after the guest scans.'
                )}
              </p>
            )}

            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <QrCode className="mt-0.5 h-3 w-3 shrink-0" />
              {t(
                '选择微信支付后将生成二维码供宾客扫码；款项由 Stripe 确认后自动回写预订。',
                'Choosing WeChat Pay shows a QR code for the guest; Stripe confirms and writes the payment back to the booking.'
              )}
            </p>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700">{error}</p>}
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {session ? t('关闭', 'Close') : t('取消', 'Cancel')}
          </Button>
          {!session && (
            <Button onClick={start} disabled={busy} className="gap-2">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {method === 'wechat' ? t('生成二维码', 'Generate QR code') : t('前往 Stripe 结账', 'Continue to Stripe')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}