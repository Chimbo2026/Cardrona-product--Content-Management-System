import { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import useList from '@/hooks/useList';
import { useLang } from '@/lib/i18n';
import { PAYMENT_CURRENCIES } from '@/lib/currency';
import { giftVoucherCode } from '@/lib/giftVouchers';

const nextYear = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

// Sells a gift voucher: issues the voucher code and records the sale as a paid booking.
export default function GiftVoucherDialog({ open, onOpenChange, onSaved }) {
  const { t } = useLang();
  const { toast } = useToast();
  const { items: guests } = useList('Guest', {}, { sort: 'full_name', limit: 400 });

  const fields = useMemo(
    () => [
      {
        name: 'guest_id',
        label: t('购买宾客', 'Purchaser'),
        type: 'select',
        required: true,
        colSpan: 2,
        options: guests.map((g) => ({ value: g.id, label: `${g.full_name} · ${g.email || '—'}` })),
      },
      { name: 'amount', label: t('礼券面值（NZD）', 'Voucher value (NZD)'), type: 'number', required: true },
      {
        name: 'currency',
        label: t('币种', 'Currency'),
        type: 'select',
        options: PAYMENT_CURRENCIES.map((c) => ({ value: c.code, label: c.code })),
      },
      { name: 'expires_at', label: t('有效期至', 'Valid until'), type: 'date' },
      { name: 'notes', label: t('备注', 'Notes'), type: 'textarea', colSpan: 2 },
    ],
    [guests, t]
  );

  const submit = async (values) => {
    const guest = guests.find((g) => g.id === values.guest_id);
    if (!guest) throw new Error(t('请选择购买宾客。', 'Choose the purchaser before saving.'));
    const amount = Number(values.amount) || 0;
    if (amount <= 0) throw new Error(t('礼券面值必须大于 0。', 'The voucher value must be above 0.'));

    const code = giftVoucherCode();
    const bookingRef = `CRD-${3100 + Math.floor(Math.random() * 800)}`;
    const today = new Date().toISOString().slice(0, 10);

    await base44.entities.GiftVoucher.create({
      code,
      guest_name: guest.full_name,
      email: guest.email || '',
      amount,
      balance: amount,
      currency: values.currency || 'NZD',
      status: 'Active',
      expires_at: values.expires_at || nextYear(),
      sold_on_ref: bookingRef,
      notes: values.notes || '',
    });

    await base44.entities.Booking.create({
      booking_ref: bookingRef,
      guest_id: guest.id,
      guest_name: guest.full_name,
      email: guest.email || '',
      phone: guest.phone || '',
      visit_date: today,
      guests_count: 1,
      activity: 'Gift Voucher',
      amount,
      currency: values.currency || 'NZD',
      payment_status: 'Paid',
      payment_method: 'Card',
      payment_terms: 'Pay now',
      amount_paid: amount,
      booking_status: 'Completed',
      channel: 'Online',
      season: 'Winter',
      notes: `${t('礼券', 'Gift voucher')} ${code}`,
    });

    toast({
      title: t('礼券已售出', 'Gift voucher sold'),
      description: `${code} · ${guest.full_name} · $${amount}`,
    });
    onSaved?.();
  };

  return (
    <RecordFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('售卖礼券', 'Sell a gift voucher')}
      description={t('礼券可在后续预订中抵扣，售卖记为一笔已付款预订。', 'Vouchers can be redeemed on later bookings; the sale is recorded as a paid booking.')}
      fields={fields}
      initialValues={{ currency: 'NZD', expires_at: nextYear() }}
      onSubmit={submit}
      submitLabel={t('售出礼券', 'Sell voucher')}
      note={t('礼券号码生成后显示在提示中，请转交宾客。', 'The voucher code is generated on save — pass it on to the guest.')}
    />
  );
}