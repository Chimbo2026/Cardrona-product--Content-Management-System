const STORAGE_KEY = 'cardrona.demoBookings';

export const getDemoBookings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const records = stored ? JSON.parse(stored) : [];
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
};

export const getDemoBooking = (id) =>
  getDemoBookings().find((booking) => booking.id === id || booking.order_no === id) || null;

// Keep guest contact, passport and waiver data out of browser storage in demo mode.
export const saveDemoBooking = (payload) => {
  const booking = {
    id: `demo-${payload.order_no}`,
    order_no: payload.order_no,
    product_id: payload.product_id,
    product_name: payload.product_name,
    product_category: payload.product_category,
    visit_date: payload.visit_date,
    visit_end_date: payload.visit_end_date,
    quantity: payload.quantity,
    unit_price: payload.unit_price,
    subtotal: payload.subtotal,
    discount_code: payload.discount_code,
    discount_amount: payload.discount_amount,
    total_amount: payload.total_amount,
    currency: 'NZD',
    status: payload.status,
    payment_method: payload.payment_method,
    payment_status: payload.payment_status,
    payment_ref: payload.payment_ref,
    pass_type: payload.pass_type,
    pass_type_label: payload.pass_type_label,
    age_band: payload.age_band,
    age_band_label: payload.age_band_label,
    payment_plan: payload.payment_plan,
    deposit_amount: payload.deposit_amount,
    aspenware_sync_status: 'not_connected',
    created_date: new Date().toISOString(),
    demo: true,
  };

  try {
    const records = getDemoBookings().filter((item) => item.id !== booking.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...records]));
  } catch {
    // The booking receipt can still be shown for this session if storage is unavailable.
  }
  return booking;
};
