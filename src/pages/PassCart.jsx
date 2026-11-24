import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { computeDiscount, formatCNY } from '@/lib/booking';
import { lookupDiscount } from '@/lib/discounts';
import { usePassCart } from '@/lib/PassCartContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ageBandOf, passTypeOf, paymentPlanOf } from '@/lib/passes';
import { bikeAgeOf, bikePackageOf, bikeSizeOf } from '@/lib/bikeRental';
import BookingStepper from '@/components/BookingStepper';

export default function PassCart() {
  const { lang, bi } = useLanguage();
  const navigate = useNavigate();
  const { line, clear } = usePassCart();

  const [showDetails, setShowDetails] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  const [checking, setChecking] = useState(false);

  if (!line) {
    return (
      <div className="px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 text-[12.5px] text-muted-foreground">
          {bi('购物车还是空的', 'Your cart is empty')}
        </p>
        <Button asChild className="mt-4 h-10 rounded-full px-5">
          <Link to="/booking">{bi('去看看雪票', 'Browse ski passes')}</Link>
        </Button>
      </div>
    );
  }

  const isBike = line.mode === 'bike';
  const type = isBike ? null : passTypeOf(line.passKey);
  const band = isBike ? null : ageBandOf(line.ageKey);
  const plan = paymentPlanOf(line.plan);
  const subtotal = Number(line.unitPrice || 0);
  const discount = appliedCode ? computeDiscount(appliedCode, subtotal) : 0;
  const total = Math.max(subtotal - discount, 0);
  const dueToday = plan.deposit > 0 ? Math.min(plan.deposit, total) : total;
  const productName = lang === 'en' ? line.productNameEn || line.productName : line.productName;

  const errorText = (result) => {
    switch (result.error) {
      case 'inactive':
        return bi('该折扣码已停用', 'That code is no longer active');
      case 'not_started':
        return bi(`折扣码 ${result.record?.valid_from} 起生效`, `Valid from ${result.record?.valid_from}`);
      case 'expired':
        return bi('折扣码已过期', 'That code has expired');
      case 'limit':
        return bi('折扣码使用次数已达上限', 'That code has reached its usage limit');
      case 'scope':
        return bi(`该折扣码仅适用于「${result.scope}」类产品`, `That code only applies to ${result.scope} products`);
      default:
        return bi('折扣码不存在', 'That code does not exist');
    }
  };

  const applyCode = async () => {
    setCodeError('');
    if (!codeInput.trim()) return;
    setChecking(true);
    const result = await lookupDiscount(codeInput, '套餐');
    setChecking(false);
    if (!result.record) {
      setAppliedCode(null);
      setCodeError(errorText(result));
      return;
    }
    setAppliedCode(result.record);
    setCodeInput(result.record.code);
  };

  const removeLine = () => {
    clear();
    setAppliedCode(null);
    setCodeInput('');
    setCodeError('');
  };

  const checkout = () => {
    // 山地车租赁把配置页选好的日期与单价一起带入预订流程
    const query = isBike
      ? new URLSearchParams({
          date: line.startDate,
          to: line.startDate,
          guests: '1',
          price: String(line.unitPrice || 0),
        })
      : new URLSearchParams({
          pass: line.passKey,
          age: line.ageKey,
          plan: line.plan,
          guests: '1',
        });
    if (appliedCode?.code) query.set('code', appliedCode.code);
    navigate(`/booking/${line.productId}?${query.toString()}`);
  };

  const bikeSize = bikeSizeOf(line.sizeKey);
  const bikePackage = bikePackageOf(line.packageKey);
  const bikeAge = bikeAgeOf(line.ageKey);
  const pills = isBike
    ? [
        bikePackage.label[lang] || bikePackage.label.zh,
        bikeSize ? bikeSize.label[lang] || bikeSize.label.zh : null,
        bikeAge ? bikeAge.label[lang] || bikeAge.label.zh : null,
        line.insurance ? bi('含自行车保险', 'Bike insurance') : null,
        line.startDate,
      ].filter(Boolean)
    : [
        plan.label[lang] || plan.label.zh,
        type.label[lang] || type.label.zh,
        ...(type.rule && line.accepted ? [type.rule[lang] || type.rule.zh] : []),
      ];

  return (
    <div className="px-4 py-3 pb-8">
      <BookingStepper
        steps={[bi('雪票', 'Pass'), bi('购物车', 'Cart'), bi('日期', 'Date'), bi('游客', 'Guests'), bi('支付', 'Pay'), bi('完成', 'Done')]}
        current={2}
      />
      <h1 className="font-heading text-[22px] font-semibold">{bi('购物车', 'Cart')}</h1>

      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-muted px-3.5 py-1.5">
          <span className="text-[9.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {bi('待分配', 'Unassigned')}
          </span>
        </div>

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-medium">{productName}</p>
            <span className="shrink-0 text-[13px] font-medium">{formatCNY(subtotal)}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {pills.map((pill) => (
              <span
                key={pill}
                className="rounded-full bg-secondary px-2.5 py-1 text-[10px] leading-none text-muted-foreground"
              >
                {pill}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-4 text-[10.5px]">
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="uppercase tracking-wide text-muted-foreground underline underline-offset-2"
            >
              {showDetails ? bi('收起详情', 'Hide details') : bi('查看详情', 'Show details')}
            </button>
            <button
              type="button"
              onClick={removeLine}
              className="uppercase tracking-wide text-muted-foreground underline underline-offset-2"
            >
              {bi('移除', 'Remove')}
            </button>
          </div>

          {showDetails && isBike && (
            <dl className="mt-3 space-y-1.5 rounded-xl bg-secondary/60 p-3 text-[11px] leading-relaxed">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{bi('开始日期', 'Start date')}</dt>
                <dd>{line.startDate || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{bi('套餐', 'Package')}</dt>
                <dd>{bikePackage.label[lang] || bikePackage.label.zh}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{bi('尺码', 'Size')}</dt>
                <dd>{bikeSize ? bikeSize.label[lang] || bikeSize.label.zh : bi('到店选择', 'Chosen in store')}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{bi('年龄段', 'Age')}</dt>
                <dd>{bikeAge ? bikeAge.label[lang] || bikeAge.label.zh : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{bi('单价', 'Unit price')}</dt>
                <dd>{formatCNY(subtotal)}</dd>
              </div>
            </dl>
          )}

          {showDetails && !isBike && (
            <dl className="mt-3 space-y-1.5 rounded-xl bg-secondary/60 p-3 text-[11px] leading-relaxed">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{bi('季票类型', 'Pass type')}</dt>
                <dd>{type.label[lang] || type.label.zh}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{bi('年龄段', 'Age')}</dt>
                <dd>{band ? band.label[lang] || band.label.zh : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{bi('付款方案', 'Payment plan')}</dt>
                <dd>{plan.label[lang] || plan.label.zh}</dd>
              </div>
              {plan.deposit > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{bi('今日定金', 'Deposit today')}</dt>
                  <dd>{formatCNY(plan.deposit)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{bi('规则', 'Rules')}</dt>
                <dd>{type.rule && line.accepted ? bi('已接受', 'Accepted') : bi('无', 'None')}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-muted/50 p-4">
        <h2 className="font-heading text-[14px] font-semibold">{bi('订单摘要', 'Order Summary')}</h2>

        <div className="mt-3 space-y-1.5 text-[11.5px]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{bi('小计', 'Sub-Total')}</span>
            <span>{formatCNY(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-emerald-700">
              <span>
                {bi('折扣', 'Discount')} {appliedCode.code}
              </span>
              <span>-{formatCNY(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 text-[13px] font-semibold">
            <span>
              {plan.deposit > 0
                ? bi('今日应付（含 GST）', 'Due today (incl GST)')
                : bi('总计（含 GST）', 'Total (incl GST)')}
            </span>
            <span className="font-heading text-[18px] text-primary">{formatCNY(dueToday)}</span>
          </div>
          {plan.deposit > 0 && (
            <p className="text-[10.5px] leading-relaxed text-muted-foreground">
              {bi(
                `季票全价 ${formatCNY(total)}，余款 ${formatCNY(total - dueToday)} 分 ${plan.installments} 期支付`,
                `Pass total ${formatCNY(total)}, the remaining ${formatCNY(total - dueToday)} in ${plan.installments} instalments`,
              )}
            </p>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {codeOpen ? (
            <>
              <div className="flex gap-2">
                <Input
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                  placeholder={bi('输入折扣码', 'Enter code')}
                  className="h-9 bg-card font-mono uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 shrink-0 rounded-lg bg-card"
                  onClick={applyCode}
                  disabled={checking}
                >
                  {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : bi('应用', 'Apply')}
                </Button>
              </div>
              {codeError && <p className="text-[10.5px] text-destructive">{codeError}</p>}
              {appliedCode && !codeError && (
                <p className="flex items-center gap-1.5 text-[10.5px] text-emerald-700">
                  <Tag className="h-3 w-3" />
                  {bi('已应用折扣码', 'Code applied')} {appliedCode.code}
                </p>
              )}
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-lg bg-card text-[11.5px]"
              onClick={() => setCodeOpen(true)}
            >
              {bi('使用折扣码', 'Apply Discount Code')}
            </Button>
          )}

          <Button type="button" className="h-11 w-full rounded-full" onClick={checkout}>
            {bi('去结账', 'Checkout')}
          </Button>

          <div className="text-center">
            <Link
              to="/booking"
              className="text-[10.5px] uppercase tracking-wide text-muted-foreground underline underline-offset-2"
            >
              {bi('继续挑选', 'Continue shopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
