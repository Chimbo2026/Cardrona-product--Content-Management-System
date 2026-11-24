import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePassCart } from '@/lib/PassCartContext';
import { toDateKey } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  BIKE_AGES,
  BIKE_PACKAGES,
  BIKE_SIZES,
  BIKE_INSURANCE_PRICE,
  bikeMoney,
  bikePackageOf,
  bikePrice,
  bikeTitle,
  bikeTypeOf,
  bikeTypeLabel,
  bikeTypesOf,
} from '@/lib/bikeRental';

const tile = (active) =>
  `rounded-lg border-[1.5px] bg-card text-left transition ${
    active ? 'border-primary' : 'border-border hover:border-muted-foreground/50'
  }`;

const SectionTitle = ({ title }) => <h2 className="font-heading text-[15px] font-semibold">{title}</h2>;

export default function BikeConfigurator({ product }) {
  const { lang, bi } = useLanguage();
  const { setLine } = usePassCart();
  const navigate = useNavigate();

  const types = bikeTypesOf(product);
  const ages = BIKE_AGES.filter((age) => !product.bike_age_keys || product.bike_age_keys.includes(age.key));
  const [typeKey, setTypeKey] = useState(types[0].key);
  const [packageKey, setPackageKey] = useState('full');
  const [sizeKey, setSizeKey] = useState('');
  const [ageKey, setAgeKey] = useState('adult');
  const [startDate, setStartDate] = useState(() => toDateKey(new Date(Date.now() + 86400000)));

  const [insurance, setInsurance] = useState(false);

  const insuranceFee = insurance ? BIKE_INSURANCE_PRICE : 0;
  const price = bikePrice(product, typeKey, packageKey, ageKey) + insuranceFee;
  const title = bikeTitle(product, { typeKey, sizeKey, ageKey }, lang);
  const pkg = bikePackageOf(packageKey);

  const addToCart = () => {
    setLine({
      mode: 'bike',
      productId: product.id,
      productName: product.name_zh || product.name,
      productNameEn: product.name_en || product.name,
      image: product.image_url,
      typeKey,
      sizeKey,
      packageKey,
      ageKey,
      startDate,
      insurance,
      unitPrice: price,
    });
    navigate('/pass-cart');
  };

  return (
    <div className="space-y-5">
      <section>
        <SectionTitle title={bi('开始日期', 'Start Date')} />
        <Label className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-primary" /> {bi('选择租赁开始日期', 'Pick your rental day')}
        </Label>
        <Input
          type="date"
          value={startDate}
          min={toDateKey(new Date())}
          onChange={(event) => setStartDate(event.target.value || toDateKey(new Date()))}
          className="mt-1.5 h-10 bg-card text-[12.5px]"
        />
      </section>

      <section>
        <SectionTitle title={bi('选择套餐', 'Choose Package')} />
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {BIKE_PACKAGES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPackageKey(item.key)}
              className={`px-3 py-3 ${tile(packageKey === item.key)}`}
            >
              <span className="block text-[12.5px] font-semibold leading-snug">
                {item.label[lang] || item.label.zh}
              </span>
              <span className="mt-1 block text-[10px] leading-snug text-muted-foreground">
                {item.note[lang] || item.note.zh}
              </span>
              {item.rate < 1 && (
                <span className="mt-1 block text-[10px] font-medium text-emerald-700">
                  {bi('全价 5 折', '50% of full price')}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title={bi('选择车型', 'Choose Type of Bike')} />
        <div className="mt-2.5 space-y-2">
          {types.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTypeKey(item.key)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-3 ${tile(typeKey === item.key)}`}
            >
              <span className="text-[12.5px] font-semibold leading-snug">{bikeTypeLabel(item, lang)}</span>
              <span className="shrink-0 text-[11.5px] text-muted-foreground">{bikeMoney(item.price)}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title={bi('选择尺码', 'Choose your Size')} />
        <Select value={sizeKey} onValueChange={setSizeKey}>
          <SelectTrigger className="mt-2.5 h-10 bg-card text-[12.5px]">
            <SelectValue placeholder={bi('选择尺码（选填）', 'Choose your size (optional)')} />
          </SelectTrigger>
          <SelectContent>
            {BIKE_SIZES.map((item) => (
              <SelectItem key={item.key} value={item.key} className="text-[12.5px]">
                {item.label[lang] || item.label.zh} · {item.detail[lang] || item.detail.zh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                {bikeMoney(bikePrice(product, typeKey, packageKey, item.key))}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title={bi('添加自行车保险', 'Bike Insurance Add On')} />
        <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
          {bi(
            '建议添加保险。若装备未归还或损坏，雪场可能会从您的信用卡扣款。',
            'We recommend adding insurance. If equipment is unreturned or damaged, the resort may charge your credit card.',
          )}
        </p>
        <button
          type="button"
          onClick={() => setInsurance((prev) => !prev)}
          className={`mt-2.5 flex w-full items-center justify-between gap-3 px-3 py-3 ${tile(insurance)}`}
        >
          <span className="text-[12.5px] font-semibold leading-snug">{bi('自行车保险', 'Bike Insurance')}</span>
          <span className="shrink-0 text-[11.5px] text-muted-foreground">
            {bi('每天', 'Per day')} +{bikeMoney(BIKE_INSURANCE_PRICE)}
          </span>
        </button>
      </section>

      <div className="rounded-2xl border border-border bg-card p-3.5">
        <p className="text-[9.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {bi('订单摘要', 'Item Summary')}
        </p>
        <p className="mt-2 text-[13px] font-medium leading-snug">{title}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {pkg.label[lang] || pkg.label.zh} · {bi(`${startDate} 开始`, `starts ${startDate}`)}
        </p>
        {packageKey === 'half' && (
          <p className="mt-1 text-[10.5px] text-emerald-700">
            {bi('半日套餐已按全价 5 折计价', 'Half day is priced at 50% of the full day rate')}
          </p>
        )}
        {insurance && (
          <p className="mt-1 text-[10.5px] text-muted-foreground">
            {bi('含自行车保险', 'Includes bike insurance')} +{bikeMoney(insuranceFee)}
          </p>
        )}

        <div className="mt-3 flex items-end justify-between gap-3 border-t border-border/70 pt-3">
          <div>
            <p className="text-[10px] text-muted-foreground">{bi('合计', 'Total')}</p>
            <p className="font-heading text-[19px] text-primary">{bikeMoney(price)}</p>
          </div>
          <Button type="button" className="h-11 rounded-full px-5" onClick={addToCart}>
            {bi('加入购物车', 'Add to Cart')} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
