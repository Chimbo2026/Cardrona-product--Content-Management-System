import { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import {
  ACTIVITIES,
  BOOKING_STATUSES,
  CHANNELS,
  PASS_TYPES,
  PAYMENT_STATUSES,
  PAYMENT_TERMS,
  SEASONS,
} from '@/lib/constants';

export default function BookingFormDialog({ open, onOpenChange, booking, guests, existingRefs = [], onSaved }) {
  const { toast } = useToast();

  const fields = useMemo(
    () => [
      {
        name: 'guest_id',
        label: 'Guest',
        type: 'select',
        required: true,
        colSpan: 2,
        options: guests.map((g) => ({ value: g.id, label: `${g.full_name} · ${g.country || '—'}` })),
        hint: 'Guest names and contact details are copied from the guest record.',
      },
      { name: 'visit_date', label: 'Visit date', type: 'date', required: true },
      { name: 'guests_count', label: 'Number of guests', type: 'number', required: true },
      { name: 'activity', label: 'Product / activity', type: 'select', required: true, options: ACTIVITIES },
      { name: 'pass_type', label: 'Lift pass type', type: 'select', options: PASS_TYPES },
      { name: 'lesson_type', label: 'Lesson booking', type: 'text', placeholder: 'e.g. Group · Beginner' },
      { name: 'season', label: 'Season', type: 'select', options: SEASONS },
      { name: 'amount', label: 'Booking value (NZD)', type: 'number', required: true },
      { name: 'channel', label: 'Booking channel', type: 'select', options: CHANNELS },
      { name: 'payment_status', label: 'Payment status', type: 'select', required: true, options: PAYMENT_STATUSES },
      { name: 'payment_terms', label: 'Payment terms', type: 'select', options: PAYMENT_TERMS },
      {
        name: 'payment_due_date',
        label: 'Payment due date',
        type: 'date',
        hint: 'Used when the guest pays later; leave blank for payment now.',
      },
      { name: 'booking_status', label: 'Booking status', type: 'select', required: true, options: BOOKING_STATUSES },
      {
        name: 'rental_notes',
        label: 'Rental / equipment requirements',
        type: 'text',
        placeholder: 'Skis 170cm, boots 27.5…',
        colSpan: 2,
      },
      { name: 'notes', label: 'Internal notes', type: 'textarea', colSpan: 2 },
    ],
    [guests]
  );

  const initialValues = booking
    ? {
        guest_id: booking.guest_id || '',
        visit_date: booking.visit_date || '',
        guests_count: booking.guests_count ?? 1,
        activity: booking.activity || '',
        pass_type: booking.pass_type || '',
        lesson_type: booking.lesson_type || '',
        season: booking.season || 'Winter',
        amount: booking.amount ?? '',
        channel: booking.channel || 'Online',
        payment_status: booking.payment_status || 'Pending',
        payment_terms: booking.payment_terms || 'Pay now',
        payment_due_date: booking.payment_due_date || '',
        booking_status: booking.booking_status || 'Confirmed',
        rental_notes: booking.rental_notes || '',
        notes: booking.notes || '',
      }
    : {
        visit_date: new Date().toISOString().slice(0, 10),
        guests_count: 1,
        activity: 'Lift Pass',
        season: 'Winter',
        channel: 'Online',
        payment_status: 'Pending',
        payment_terms: 'Pay now',
        booking_status: 'Confirmed',
      };

  const nextRef = () => {
    let n = 2600 + Math.floor(Math.random() * 400);
    let ref = `CRD-${n}`;
    while (existingRefs.includes(ref)) {
      n += 1;
      ref = `CRD-${n}`;
    }
    return ref;
  };

  const submit = async (values) => {
    const guest = guests.find((g) => g.id === values.guest_id);
    if (!guest) throw new Error('Choose a guest from the list before saving.');
    const payload = {
      ...values,
      guest_name: guest.full_name,
      email: guest.email || '',
      phone: guest.phone || '',
    };
    if (booking) {
      await base44.entities.Booking.update(booking.id, payload);
      toast({ title: 'Booking updated', description: `${booking.booking_ref} saved.` });
    } else {
      const booking_ref = nextRef();
      await base44.entities.Booking.create({ ...payload, booking_ref });
      toast({ title: 'Booking created', description: `${booking_ref} · ${guest.full_name}` });
    }
    onSaved?.();
  };

  return (
    <RecordFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={booking ? `Edit booking ${booking.booking_ref}` : 'New demo booking'}
      description="All booking records are fictional sample data for demonstration."
      fields={fields}
      initialValues={initialValues}
      onSubmit={submit}
      submitLabel={booking ? 'Save changes' : 'Create booking'}
      note={booking ? undefined : 'A unique booking reference is generated automatically (CRD-xxxx).'}
    />
  );
}