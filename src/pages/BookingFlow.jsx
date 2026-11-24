import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Tag, ArrowRight, ArrowLeft, BadgePercent } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAgent } from '@/lib/AgentContext';
import { getEntrySource } from '@/lib/attribution';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BookingStepper from '@/components/BookingStepper';
import StepSchedule from '@/components/booking/StepSchedule';
import StepGuest from '@/components/booking/StepGuest';
import StepPayment from '@/components/booking/StepPayment';
import BookingDone from '@/components/booking/BookingDone';
import {
  computeDiscount,
  daysBetween,
  formatCNY,
  generateOrderNo,
  isPeakDate,
  toDateKey,
  unitPriceFor,
} from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { localizedField } from '@/lib/i18n/localize';
import { ageBandOf, passPrice, passTypeOf, paymentPlanOf } from '@/lib/passes';
import { usePassCart } from '@/lib/PassCartContext';
import { catalogProduct } from '@/lib/cardronaProducts';
import { saveDemoBooking } from '@/lib/demoBookings';

export default function BookingFlow() {
  const { lang, bi } = useLanguage();
  const STEPS = [
    bi('雪票', 'Pass'),
    bi('购物车', 'Cart'),
    bi('选择日期', 'Date'),
    bi('游客信息', 'Guests'),
    bi('支付', 'Payment'),
    bi('完成', 'Done'),
  ];
  const { id } = useParams();
  const { agent } = useAgent();
  const { clear: clearPassCart } = usePassCart();
  const autoCodeRef = useRef('');
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const searchParams = new URLSearchParams(window.location.search);
  const initialDate = searchParams.get('date') || toDateKey(new Date(Date.now() + 86400000));
  // 季票配置页带入的选项：季票类型、年龄段与付款方案
  const passKey = searchParams.get('pass') || '';
  const ageKey = searchParams.get('age') || '';
  const paymentPlan = paymentPlanOf(searchParams.get('plan') || 'now');
  const passBand = ageBandOf(ageKey);
  const passType = passBand ? passTypeOf(passKey) : null;
  // 租赁配置页带入的单价：已按车型、套餐与年龄段算好
  const carriedPrice = Number(searchParams.get('price')) || 0;
  const selectedOption = catalogProduct(id)?.booking_options?.find((option) => option.key === searchParams.get('option'));

  // 日期已由租赁页选定，直接进入游客信息
  const [step, setStep] = useState(carriedPrice > 0 ? 2 : 1);
  const [visitDate, setVisitDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(searchParams.get('to') || initialDate);
  const [quantity, setQuantity] = useState(() => Math.min(Math.max(Number(searchParams.get('guests')) || 1, 1), 10));

  const [codeInput, setCodeInput] = useState(searchParams.get('code') || '');
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [appliedCode, setAppliedCode] = useState(null);

  const [form, setForm] = useState({
    name_pinyin: '',
    legal_name: '',
    dob: '',
    nationality: '',
    document_no: '',
    phone: '',
    email: '',
    source: getEntrySource(),
  });
  const [extraGuests, setExtraGuests] = useState([]);
  const [waiverChecked, setWaiverChecked] = useState(false);
  const [signature, setSignature] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wechat_pay');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    let active = true;
    base44.entities.Product.get(id)
      .then((record) => {
        if (active) setProduct(record || catalogProduct(id));
      })
      .catch(() => {
        if (active) setProduct(catalogProduct(id));
      })
      .finally(() => {
        if (active) setLoadingProduct(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    setExtraGuests((prev) => {
      const next = [...prev];
      while (next.length < quantity - 1) {
        next.push({ name_pinyin: '', legal_name: '', dob: '', nationality: '' });
      }
      return next.slice(0, Math.max(quantity - 1, 0));
    });
  }, [quantity]);

  // 代理登录后自动应用 10% 代理折扣
  useEffect(() => {
    if (!agent || appliedCode) return;
    base44.entities.DiscountCode.filter({ code: agent.code }).then((results) => {
      const record = results?.[0];
      setAppliedCode(
        record && record.status === 'active'
          ? record
          : { code: agent.code, type: 'percent', value: agent.rate, agent_name: agent.label },
      );
    }).catch(() => setAppliedCode({
      code: agent.code,
      type: 'percent',
      value: agent.rate,
      agent_name: agent.label,
    }));
  }, [agent, appliedCode]);

  const isPeak = isPeakDate(visitDate);
  const unitPrice = carriedPrice
    ? carriedPrice
    : passBand
      ? passPrice(product, passKey, ageKey)
      : selectedOption
        ? Number(selectedOption.price)
        : unitPriceFor(product, visitDate);
  const days = daysBetween(visitDate, endDate);
  const subtotal = unitPrice * quantity * days;
  const discountAmount = appliedCode ? computeDiscount(appliedCode, subtotal) : 0;
  const total = Math.max(subtotal - discountAmount, 0);

  const handleField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const handleExtraGuest = (index, name, value) =>
    setExtraGuests((prev) => prev.map((guest, i) => (i === index ? { ...guest, [name]: value } : guest)));

  const guestStepIncomplete =
    step === 2 &&
    (!form.name_pinyin ||
      !form.legal_name ||
      !form.dob ||
      !form.nationality ||
      !form.document_no ||
      !form.phone ||
      !form.email ||
      extraGuests.some((guest) => !guest.name_pinyin || !guest.dob || !guest.nationality) ||
      !waiverChecked ||
      !signature);

  const applyCode = async () => {
    const code = codeInput.trim().toUpperCase();
    setCodeError('');
    if (!code) {
      setAppliedCode(null);
      return;
    }
    if (agent && code === agent.code) {
      setAppliedCode({ code, type: 'percent', value: agent.rate, agent_name: agent.label });
      return;
    }
    setCheckingCode(true);
    const results = await base44.entities.DiscountCode.filter({ code });
    const record = results[0];
    setCheckingCode(false);

    if (!record) {
      setAppliedCode(null);
      setCodeError(bi('折扣码不存在', 'That code does not exist'));
      return;
    }
    if (record.status !== 'active') {
      setAppliedCode(null);
      setCodeError(bi('该折扣码已停用', 'That code is no longer active'));
      return;
    }
    const today = toDateKey(new Date());
    if (record.valid_from && today < record.valid_from) {
      setAppliedCode(null);
      setCodeError(bi(`折扣码 ${record.valid_from} 起生效`, `Valid from ${record.valid_from}`));
      return;
    }
    if (record.valid_to && today > record.valid_to) {
      setAppliedCode(null);
      setCodeError(bi('折扣码已过期', 'That code has expired'));
      return;
    }
    if (record.usage_limit > 0 && Number(record.used_count || 0) >= Number(record.usage_limit)) {
      setAppliedCode(null);
      setCodeError(bi('折扣码使用次数已达上限', 'That code has reached its usage limit'));
      return;
    }
    if (record.scope && record.scope !== '全部' && product && record.scope !== product.category) {
      setAppliedCode(null);
      setCodeError(
        bi(
          `该折扣码仅适用于「${record.scope}」类产品`,
          `That code only applies to ${record.scope} products`,
        ),
      );
      return;
    }
    setAppliedCode(record);
  };

  // 购物车带入的折扣码自动校验一次
  useEffect(() => {
    if (!codeInput || !product || appliedCode || autoCodeRef.current === codeInput) return;
    autoCodeRef.current = codeInput;
    applyCode();
  }, [codeInput, product, appliedCode]);

  const goNext = () => {
    setFormError('');
    if (step === 2) {
      if (
        !form.name_pinyin ||
        !form.legal_name ||
        !form.dob ||
        !form.nationality ||
        !form.document_no ||
        !form.phone ||
        !form.email
      ) {
        setFormError(
          bi(
            '请填写游客的拼音姓名、法定姓名、出生日期、国籍、护照号码、手机与邮箱',
            'Enter the passport name, legal name, date of birth, nationality, passport number, phone and email',
          ),
        );
        return;
      }
      if (extraGuests.some((guest) => !guest.name_pinyin || !guest.dob || !guest.nationality)) {
        setFormError(
          bi(
            '请补全同行游客的拼音姓名、出生日期与国籍',
            'Complete each extra guest name, date of birth and nationality',
          ),
        );
        return;
      }
      if (!waiverChecked) {
        setFormError(bi('请阅读并勾选同意免责声明', 'Please read and accept the liability waiver'));
        return;
      }
      if (!signature) {
        setFormError(bi('请在签名区手写签名', 'Please sign in the signature box'));
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePay = async () => {
    setSubmitting(true);
    try {
      const orderNo = generateOrderNo();
      const fromAgent = Boolean(appliedCode?.agent_email);
      // 先享后付只收定金，订单保持待支付状态
      const deferred = paymentPlan.key === 'later' || paymentMethod === 'agent_transfer';
      // 游客未登录时无法上传签名图，订单仍保留签名姓名与签署时间
      let signatureFileUri = '';
      try {
        const signatureBlob = await (await fetch(signature)).blob();
        const signatureFile = new File([signatureBlob], `${orderNo}-signature.png`, {
          type: 'image/png',
        });
        const uploaded = await base44.integrations.Core.UploadPrivateFile({
          file: signatureFile,
        });
        signatureFileUri = uploaded.file_uri;
      } catch {
        signatureFileUri = '';
      }
      const payload = {
        order_no: orderNo,
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        visit_date: visitDate,
        visit_end_date: endDate,
        quantity,
        unit_price: unitPrice,
        subtotal,
        discount_code: appliedCode?.code || '',
        discount_amount: discountAmount,
        total_amount: total,
        currency: 'NZD',
        status: deferred ? 'pending_payment' : 'confirmed',
        payment_method: paymentMethod,
        payment_status: deferred ? 'unpaid' : 'paid',
        payment_ref: deferred ? '' : `SIM-${orderNo.slice(-6)}`,
        pass_type: passBand ? passKey : '',
        pass_type_label: passType ? passType.title.zh : '',
        age_band: passBand ? ageKey : '',
        age_band_label: passBand ? passBand.label.zh : '',
        payment_plan: paymentPlan.key,
        deposit_amount: paymentPlan.deposit || 0,
        agent_email: appliedCode?.agent_email || '',
        agent_name: appliedCode?.agent_name || '',
        source: fromAgent ? '代理推荐' : form.source,
        guest_name_pinyin: form.name_pinyin,
        guest_legal_name: form.legal_name,
        guest_dob: form.dob,
        guest_nationality: form.nationality,
        guest_document_no: form.document_no,
        guest_phone: form.phone,
        guest_email: form.email,
        extra_guests: extraGuests,
        waiver_signed: waiverChecked,
        waiver_signature: form.legal_name || form.name_pinyin,
        waiver_signature_file: signatureFileUri,
        waiver_signed_at: new Date().toISOString(),
        aspenware_sync_status: 'not_connected',
      };
      let saved;
      try {
        saved = await base44.entities.Booking.create(payload);
      } catch {
        saved = saveDemoBooking(payload);
      }
      if (appliedCode?.id && !saved.demo) {
        try {
          await base44.entities.DiscountCode.update(appliedCode.id, {
            used_count: Number(appliedCode.used_count || 0) + 1,
          });
        } catch {
          // A simulated booking should still reach its confirmation screen.
        }
      }
      clearPassCart();
      setCreatedBooking(saved);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-[13px] text-muted-foreground">
        {bi('产品不存在或已下架', 'This product is unavailable')}
      </div>
    );
  }

  return (
    <div className="px-4 pb-48 pt-4">
      <BookingStepper steps={STEPS} current={step + 2} />

      <div className="mt-3 rounded-2xl border border-border bg-card p-3.5">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">BOOK</p>
        <h1 className="mt-1 font-heading text-[19px] leading-tight text-accent-foreground">{localizedField(product, 'name', lang)}</h1>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          {visitDate} – {endDate} · {bi(`${days} 天`, `${days} day${days === 1 ? '' : 's'}`)} ·{' '}
          {bi(`${quantity} 人`, `${quantity} guest${quantity === 1 ? '' : 's'}`)} ·{' '}
          {bi('单价', 'each')} {formatCNY(unitPrice)}
          {isPeak && !carriedPrice ? bi('（周末/旺季）', ' (weekend/peak)') : ''}
        </p>
        {passBand && (
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {bi('季票', 'Pass')}: {passType.title[lang] || passType.title.zh} ·{' '}
            {passBand.label[lang] || passBand.label.zh} · {paymentPlan.label[lang] || paymentPlan.label.zh}
            {paymentPlan.deposit
              ? bi(
                  `（今日支付 ${formatCNY(paymentPlan.deposit)} 定金）`,
                  ` (${formatCNY(paymentPlan.deposit)} deposit today)`,
                )
              : ''}
          </p>
        )}
        {agent && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10.5px] font-medium text-amber-900">
            <BadgePercent className="h-3 w-3" />
            {bi(
              `已登录（${agent.rate}% ${agent.label}）· 已应用 ${agent.code}`,
              `Agent rate applied (${agent.rate}%) · ${agent.code}`,
            )}
          </div>
        )}
      </div>

      <div className="mt-5">
        {step === 1 && (
          <>
            <StepSchedule
              product={product}
              visitDate={visitDate}
              onVisitDate={setVisitDate}
              endDate={endDate}
              onEndDate={setEndDate}
              days={days}
              quantity={quantity}
              onQuantity={setQuantity}
              isPeak={isPeak}
              unitPrice={unitPrice}
              subtotal={subtotal}
            />
            <div className="mt-5 rounded-2xl border border-border bg-card p-3.5">
              <Label className="flex items-center gap-1.5 text-[12px]">
                <Tag className="h-3.5 w-3.5 text-accent-foreground" /> {bi('代理折扣码', 'Agent discount code')}
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder={bi('选填，例如 KIWI10', 'Optional, e.g. KIWI10')}
                  className="h-10 font-mono uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 rounded-xl"
                  onClick={applyCode}
                  disabled={checkingCode}
                >
                  {checkingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : bi('应用', 'Apply')}
                </Button>
              </div>
              {codeError && <p className="mt-2 text-[11px] text-destructive">{codeError}</p>}
              {appliedCode && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-2 text-[11px] text-amber-900">
                  <BadgePercent className="h-3.5 w-3.5" />
                  <span>
                    {bi('已应用', 'Applied')} {appliedCode.code}（
                    {appliedCode.type === 'percent'
                      ? bi(`${appliedCode.value}% 折扣`, `${appliedCode.value}% off`)
                      : bi(`立减 ${formatCNY(appliedCode.value)}`, `${formatCNY(appliedCode.value)} off`)}
                    ）
                    {appliedCode.agent_name ? ` · ${appliedCode.agent_name}` : ''}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <StepGuest
            form={form}
            onField={handleField}
            quantity={quantity}
            extraGuests={extraGuests}
            onExtraGuest={handleExtraGuest}
            waiverChecked={waiverChecked}
            onWaiver={setWaiverChecked}
            signature={signature}
            onSignature={setSignature}
          />
        )}

        {step === 3 && (
          <StepPayment
            method={paymentMethod}
            onMethod={setPaymentMethod}
            total={total}
            discountAmount={discountAmount}
          />
        )}

        {step === 4 && <BookingDone booking={createdBooking} />}
      </div>

      {step < 4 && (
        <div className="fixed inset-x-0 bottom-[calc(62px+env(safe-area-inset-bottom))] z-30 mx-auto max-w-[430px] border-t border-border bg-background/95 px-4 py-2.5 backdrop-blur md:absolute">
          {paymentPlan.deposit && step === 3 && (
            <p className="mb-2 text-[10.5px] text-muted-foreground">
              {bi(
                `今日支付 ${formatCNY(paymentPlan.deposit)} 定金，余款分 ${paymentPlan.installments} 期`,
                `${formatCNY(paymentPlan.deposit)} due today, the rest in ${paymentPlan.installments} instalments`,
              )}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                disabled={step === 1 || submitting}
                className="flex items-center gap-1 text-[10px] text-muted-foreground disabled:opacity-60"
              >
                <ArrowLeft className="h-3 w-3" /> {bi('合计', 'Total')}
              </button>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-heading text-[18px] leading-none text-primary">{formatCNY(total)}</span>
                {discountAmount > 0 && (
                  <span className="text-[10px] text-muted-foreground line-through">{formatCNY(subtotal)}</span>
                )}
              </div>
            </div>
            {step < 3 ? (
              <Button
                type="button"
                className="h-10 min-w-[132px] rounded-full px-5 text-[12px]"
                onClick={goNext}
                disabled={guestStepIncomplete}
              >
                {bi('下一步', 'Continue')} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" className="h-10 min-w-[132px] rounded-full px-5 text-[12px]" onClick={handlePay} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {bi('处理中…', 'Processing…')}
                  </>
                ) : (
                  bi('确认支付', 'Confirm payment')
                )}
              </Button>
            )}
          </div>
          {discountAmount > 0 && (
            <p className="mt-1.5 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-900">
              {appliedCode?.agent_name
                ? bi(
                    `Gold agent ${appliedCode.value}% 优惠 -${formatCNY(discountAmount)}`,
                    `Gold agent ${appliedCode.value}% off -${formatCNY(discountAmount)}`,
                  )
                : bi(`优惠 -${formatCNY(discountAmount)}`, `Discount -${formatCNY(discountAmount)}`)}
            </p>
          )}
          {formError && <p className="mt-1 text-[10px] text-destructive">{formError}</p>}
          {guestStepIncomplete && !formError && (
            <p className="mt-1 text-[9px] text-muted-foreground">
              {bi('请填写游客信息、接受免责条款并签名', 'Complete guest details, accept the waiver and sign to continue')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
