import { CreditCard, MessageSquare, Landmark, Lock } from 'lucide-react';
import IntegrationNotice from '@/components/IntegrationNotice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCNY } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const METHODS = [
  {
    key: 'wechat_pay',
    label: { zh: '微信支付', en: 'WeChat Pay' },
    desc: { zh: '仅支持中国大陆银行卡', en: 'Mainland China cards only' },
    icon: MessageSquare,
  },
  {
    key: 'card',
    label: { zh: 'Visa / Mastercard', en: 'Visa / Mastercard' },
    desc: { zh: '境外信用卡，支持 3D 验证', en: 'International cards with 3-D Secure' },
    icon: CreditCard,
  },
  {
    key: 'agent_transfer',
    label: { zh: '代理转账', en: 'Agent transfer' },
    desc: { zh: '合作代理线下结算', en: 'Settled offline with your agent' },
    icon: Landmark,
  },
];

export default function StepPayment({ method, onMethod, total, discountAmount }) {
  const { lang, bi } = useLanguage();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-3.5">
        <p className="text-[12px] font-medium">{bi('选择支付方式', 'Choose a payment method')}</p>
        <div className="mt-3 space-y-2">
          {METHODS.map((item) => {
            const Icon = item.icon;
            const active = method === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onMethod(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  active ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-secondary/60'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[13px] font-medium">
                    {item.label[lang === 'en' ? 'en' : 'zh']}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {item.desc[lang === 'en' ? 'en' : 'zh']}
                  </span>
                </span>
                <span
                  className={`ml-auto h-4 w-4 rounded-full border ${
                    active ? 'border-primary bg-primary' : 'border-border'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {method === 'wechat_pay' && <IntegrationNotice type="wechat_pay" />}
      {method === 'card' && (
        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium">{bi('银行卡信息', 'Card details')}</p>
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><Lock className="h-3 w-3" /> 3-D Secure</span>
          </div>
          <Label className="mt-3 block text-[10px]">{bi('卡号', 'Card number')}</Label>
          <Input readOnly value="4242 4242 4242 4242" className="mt-1 h-9 bg-secondary/65 font-mono tracking-wider" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">{bi('有效期 MM/YY', 'Expiry MM/YY')}</Label>
              <Input readOnly value="MM / YY" className="mt-1 h-9 bg-secondary/65" />
            </div>
            <div>
              <Label className="text-[10px]">CVC</Label>
              <Input readOnly value="123" className="mt-1 h-9 bg-secondary/65" />
            </div>
          </div>
          <Label className="mt-2 block text-[10px]">{bi('持卡人姓名', 'Cardholder name')}</Label>
          <Input readOnly value="ZHANG SAN" className="mt-1 h-9 bg-secondary/65" />
          <Label className="mt-2 block text-[10px]">{bi('账单国家', 'Billing country')}</Label>
          <div className="mt-1 rounded-lg border border-input bg-secondary/65 px-3 py-2 text-[11px]">{bi('新西兰', 'New Zealand')}</div>
          <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
            {bi('演示测试卡信息仅用于展示，不会被收集或发送。', 'Stripe test mode: sample card details are shown for preview only and are not collected or sent.')}
          </p>
        </div>
      )}
      {method === 'agent_transfer' && (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
          {bi(
            '代理转账订单将保持「待支付」状态，由运营在后台确认收款后转为「已确认」。',
            'Agent transfer orders stay pending payment until our team confirms the transfer.',
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-muted/40 p-3.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">{bi('应付金额', 'Amount due')}</span>
          <span className="font-heading text-[19px] text-primary">{formatCNY(total)}</span>
        </div>
        {discountAmount > 0 && (
          <p className="mt-1 text-[11px] text-emerald-700">
            {bi(`合计 -${formatCNY(discountAmount)}`, `Total -${formatCNY(discountAmount)}`)}
          </p>
        )}
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" />{' '}
          {bi('演示环境：点击确认后不会发生真实扣款', 'Demo build: confirming does not charge anything')}
        </p>
      </div>
    </div>
  );
}
