import { CalendarCheck, FileText, Pencil, RotateCcw, Ticket } from 'lucide-react';

// Each action turns the booking register into a focused worklist.
export const QUICK_FILTERS = [
  {
    key: 'confirmations',
    label: ['确认单', 'Confirmations'],
    icon: CalendarCheck,
    test: (b) => b.booking_status === 'Confirmed',
  },
  {
    key: 'tickets',
    label: ['门票', 'Tickets'],
    icon: Ticket,
    test: (b) => ['Lift Pass', 'Lesson'].includes(b.activity) && b.booking_status !== 'Cancelled',
  },
  {
    key: 'collection',
    label: ['取票指引', 'Collection instructions'],
    icon: FileText,
    test: (b, { today }) =>
      b.payment_status === 'Paid' &&
      b.booking_status === 'Confirmed' &&
      String(b.visit_date || '') >= today,
  },
  {
    key: 'amendments',
    label: ['修改预订', 'Amendments'],
    icon: Pencil,
    test: (b) =>
      !!b.created_date &&
      !!b.updated_date &&
      String(b.updated_date).slice(0, 10) !== String(b.created_date).slice(0, 10),
  },
  {
    key: 'refunds',
    label: ['退款', 'Refunds'],
    icon: RotateCcw,
    test: (b, { refundBookingIds }) => refundBookingIds.has(b.id) || b.payment_status === 'Refunded',
  },
];

export const findQuickFilter = (key) => QUICK_FILTERS.find((f) => f.key === key) || null;