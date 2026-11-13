import { base44 } from '@/api/base44Client';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import { useToast } from '@/components/ui/use-toast';
import { addDaysISO, prettyDate, todayISO } from '@/lib/format';
import { BIKE_INSURANCE_OPTIONS, BIKE_SIZES, BIKE_TYPES, PASS_PRODUCTS, PASS_TYPES, pricesForProduct } from '@/lib/constants';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';

export default function AddPassDaysDialog({ open, onOpenChange, defaultDate, guests, onCreated }) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const start = defaultDate || todayISO();

  const fields = [
    {
      name: 'guest_id',
      label: t('宾客', 'Guest'),
      type: 'select',
      required: true,
      colSpan: 2,
      options: guests.map((g) => ({ value: g.id, label: `${g.full_name} · ${g.country || '—'}` })),
    },
    {
      name: 'product',
      label: t('产品', 'Product'),
      type: 'select',
      required: true,
      options: PASS_PRODUCTS.map((v) => ({ value: v, label: tx(v, lang) })),
    },
    {
      name: 'bike_type',
      label: t('选择单车类型', 'Choose type of bike'),
      type: 'select',
      options: BIKE_TYPES,
      showWhen: (v) => v.product === 'Bike Rental',
      hint: t('仅在单车租赁时填写。', 'Only used for bike rentals.'),
    },
    { name: 'bike_size', label: t('选择尺寸', 'Choose your size'), type: 'select', options: BIKE_SIZES, showWhen: (v) => v.product === 'Bike Rental' },
    { name: 'bike_insurance', label: t('单车保险', 'Bike insurance'), type: 'select', options: BIKE_INSURANCE_OPTIONS, showWhen: (v) => v.product === 'Bike Rental' },
    {
      name: 'pass_type',
      label: t('票种 / 套餐', 'Pass type'),
      type: 'select',
      required: true,
      options: PASS_TYPES.map((v) => ({ value: v, label: tx(v, lang) })),
    },
    { name: 'valid_from', label: t('开始日期', 'Start date'), type: 'date', required: true },
    {
      name: 'days_valid',
      label: t('天数', 'Number of days'),
      type: 'number',
      required: true,
      defaultValue: 1,
      hint: t('日历会自动填充这些日期。', 'These days are added to the calendar automatically.'),
    },
    {
      name: 'price',
      label: t('总价 (NZD)', 'Total price (NZD)'),
      type: 'number',
      required: true,
      hint: t('示例价格，非官方定价。', 'Sample price, not official pricing.'),
    },
    { name: 'notes', label: t('备注', 'Notes'), type: 'textarea', colSpan: 2 },
  ];

  const submit = async (values) => {
    const guest = guests.find((g) => g.id === values.guest_id);
    if (!guest) throw new Error(t('请先选择宾客。', 'Choose a guest first.'));
    const days = Math.max(1, Number(values.days_valid) || 1);
    const from = values.valid_from || start;
    const to = addDaysISO(days - 1, from);
    const bike = values.product === 'Bike Rental';
    const number = `${bike ? 'BR' : 'LP'}-${(bike ? 28400 : 48400) + Math.floor(Math.random() * 500)}`;
    const today = todayISO();

    await base44.entities.LiftPass.create({
      ...values,
      product: values.product,
      guest_name: guest.full_name,
      pass_number: number,
      valid_from: from,
      valid_to: to,
      days_valid: days,
      season: bike ? 'Summer' : 'Winter',
      issue_status: 'Issued',
      usage_status: from <= today && to >= today ? 'Active' : 'Unused',
    });

    toast({
      title: t('日期已添加到日历', 'Days added to the calendar'),
      description: `${number} · ${prettyDate(from, 'd MMM')} → ${prettyDate(to, 'd MMM')}`,
    });
    onCreated?.();
  };

  const defaultProduct = 'Lift Pass';
  const rate = pricesForProduct(defaultProduct);

  return (
    <RecordFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('添加预订日期', 'Add booked days')}
      description={t(
        '为宾客添加缆车票或单车租赁日期，日历会立即显示。',
        'Add lift pass or bike rental days for a guest — the calendar updates immediately.'
      )}
      note={
        defaultDate
          ? t(`起始日期默认设为 ${prettyDate(defaultDate, 'd MMM yyyy')}。`, `Start date defaults to ${prettyDate(defaultDate, 'd MMM yyyy')}.`)
          : null
      }
      fields={fields}
      initialValues={{
        product: defaultProduct,
        pass_type: 'Single Day',
        valid_from: start,
        days_valid: 1,
        price: rate['Single Day'],
      }}
      onSubmit={submit}
      submitLabel={t('添加日期', 'Add days')}
    />
  );
}