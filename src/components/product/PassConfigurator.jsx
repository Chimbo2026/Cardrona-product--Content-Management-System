import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { formatCNY } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { usePassCart } from '@/lib/PassCartContext';
import PassSummaryCard from '@/components/product/PassSummaryCard';
import {
  AGE_BANDS,
  PAYMENT_PLANS,
  ageBandOf,
  defaultPassKey,
  passPrice,
  passTypeOf,
  passTypesFor,
} from '@/lib/passes';

const tile = (active) =>
  `rounded-lg border-[1.5px] bg-card text-left transition ${
    active ? 'border-primary' : 'border-border hover:border-muted-foreground/50'
  }`;

const SectionTitle = ({ title, sub }) => (
  <div>
    <h2 className="font-heading text-[15px] font-semibold">{title}</h2>
    {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
  </div>
);

export default function PassConfigurator({ product }) {
  const { lang, bi } = useLanguage();
  const { setLine } = usePassCart();
  const navigate = useNavigate();
  const [plan, setPlan] = useState('now');
  const [passKey, setPassKey] = useState(() => defaultPassKey(product));
  const [ageKey, setAgeKey] = useState('');
  const [accepted, setAccepted] = useState(false);

  const types = passTypesFor(product);
  const type = passTypeOf(passKey);
  const band = ageBandOf(ageKey);
  const planInfo = PAYMENT_PLANS.find((item) => item.key === plan);
  const ages = AGE_BANDS.filter((item) => type.ageKeys.includes(item.key));
  const price = passPrice(product, passKey, ageKey);
  const isFree = Boolean(band) && price === 0;
  const deposit = !isFree && planInfo.deposit && price > planInfo.deposit ? planInfo.deposit : 0;
  const total = deposit || price;
  const ready = Boolean(band) && (!type.rule || accepted);
  const hint = !band
    ? bi('请选择年龄段以查看价格', 'Choose an age band to see the price')
    : bi('请勾选接受季票规则后继续', 'Accept the pass rules to continue');

  const itemTitle = band
    ? `(1) ${type.title[lang] || type.title.zh} - ${band.short[lang] || band.short.zh}`
    : '';
  const planLabel = planInfo.label[lang] || planInfo.label.zh;

  const choosePass = (key) => {
    setPassKey(key);
    setAccepted(false);
    if (ageKey && !passTypeOf(key).ageKeys.includes(ageKey)) setAgeKey('');
  };

  const addToCart = () => {
    if (!ready) return;
    setLine({
      productId: product.id,
      productName: product.name_zh || product.name,
      productNameEn: product.name_en || product.name,
      image: product.image_url,
      passKey,
      ageKey,
      plan,
      accepted,
      unitPrice: price,
    });
    navigate('/pass-cart');
  };

  return (
    <div className="space-y-5">
      <section>
        <SectionTitle
          title={bi('付款方案', 'Payment plan')}
          sub={bi('选择你的付款方式', 'Choose your Payment Option')}
        />
        <div className="mt-2.5 grid grid-cols-2 gap-2" role="radiogroup">
          {PAYMENT_PLANS.map((item) => {
            const active = plan === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPlan(item.key)}
                className={`px-3 py-3 ${tile(active)}`}
              >
                <span className="block text-[12.5px] font-semibold leading-snug">
                  {item.label[lang] || item.label.zh}
                </span>
                {item.desc && (
                  <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">
                    {item.desc[lang] || item.desc.zh}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle title={bi('季票类型', 'Pass type')} />
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {types.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => choosePass(item.key)}
              className={`px-3 py-3 ${tile(passKey === item.key)}`}
            >
              <span className="block text-[12px] font-semibold leading-snug">
                {item.label[lang] || item.label.zh}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-2 rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-[12.5px] font-semibold">{type.label[lang] || type.label.zh}</p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
            {type.desc[lang] || type.desc.zh}
          </p>

          {type.rule ? (
            <button
              type="button"
              onClick={() => setAccepted((prev) => !prev)}
              className="mt-2.5 flex w-full items-start gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-left"
            >
              <span
                className={`mt-0.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] ${
                  accepted ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/60'
                }`}
              >
                {accepted && <Check className="h-2.5 w-2.5" />}
              </span>
              <span className="text-[10.5px] leading-relaxed">{type.rule[lang] || type.rule.zh}</span>
            </button>
          ) : (
            <p className="mt-2 text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {bi('选择一项（选填）', 'Select one (optional)')}
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionTitle title={bi('年龄段', 'Age')} />
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {ages.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setAgeKey(item.key)}
              className={`px-3 py-2.5 ${tile(ageKey === item.key)}`}
            >
              <span className="block text-[11.5px] font-semibold leading-snug">
                {item.label[lang] || item.label.zh}
              </span>
              <span className="mt-1 block text-[10.5px] text-muted-foreground">
                {item.free ? bi('免费', 'Free of Charge') : formatCNY(passPrice(product, passKey, item.key))}
              </span>
            </button>
          ))}
        </div>
      </section>

      <PassSummaryCard
        title={itemTitle}
        subtitle={planLabel}
        price={price}
        total={total}
        deposit={deposit}
        installments={planInfo.installments || 4}
        ready={ready}
        hint={hint}
        onAdd={addToCart}
      />
    </div>
  );
}