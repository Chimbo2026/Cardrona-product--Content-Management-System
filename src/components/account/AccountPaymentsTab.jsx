import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const METHODS = [
  {
    icon: Smartphone,
    name: { zh: '微信支付', en: 'WeChat Pay' },
    desc: { zh: '下单时使用微信扫码付款', en: 'Scan and pay in WeChat at checkout' },
  },
  {
    icon: CreditCard,
    name: { zh: '银行卡', en: 'Card' },
    desc: { zh: 'Visa / Mastercard，支持 3D 验证', en: 'Visa / Mastercard with 3D Secure' },
  },
  {
    icon: Banknote,
    name: { zh: '代理转账', en: 'Agent transfer' },
    desc: { zh: '签约代理可用对公转账结算', en: 'Contract agents can settle by bank transfer' },
  },
];

export default function AccountPaymentsTab() {
  const { bi } = useLanguage();

  return (
    <div className="mt-3 space-y-3 px-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {METHODS.map((method, index) => {
          const Icon = method.icon;
          return (
            <div
              key={method.name.en}
              className={`flex items-center gap-3 px-4 py-3 ${
                index > 0 ? 'border-t border-border/70' : ''
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px]">{bi(method.name.zh, method.name.en)}</span>
                <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
                  {bi(method.desc.zh, method.desc.en)}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <p className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-[10.5px] leading-relaxed text-muted-foreground">
        {bi(
          '支持在下单时选择付款方式，演示环境不会保存银行卡信息。',
          'Choose your payment method at checkout. This demo does not store card details.',
        )}
      </p>
    </div>
  );
}