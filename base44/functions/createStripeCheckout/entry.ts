import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { secrets } from "base44:runtime";
import {
  SUPPORTED_CURRENCIES,
  WECHAT_CURRENCY,
  convertFromNzd,
  fxRate,
  stripeRequest,
  toMinorUnits,
} from "../../shared/stripe.ts";

// Starts a Stripe hosted Checkout session for a booking and records the attempt.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) =>
      error.status === 401 ? null : Promise.reject(error)
    );
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Never derive return URLs from req.url / Host / Origin.
    const appUrl = req.headers.get("X-Base44-App-Url");
    if (!appUrl) return Response.json({ error: "Missing app URL" }, { status: 400 });

    const { booking_id, currency = "NZD", method = "card" } = await req.json().catch(() => ({}));
    if (!booking_id) return Response.json({ error: "booking_id is required" }, { status: 400 });

    const isWechat = method === "wechat";
    // WeChat Pay always settles in CNY; cards use the currency the front desk picked.
    const code = isWechat ? WECHAT_CURRENCY : String(currency).toUpperCase();
    if (!isWechat && !SUPPORTED_CURRENCIES.includes(code)) {
      return Response.json({ error: "Unsupported currency" }, { status: 400 });
    }

    const booking = await base44.entities.Booking.get(booking_id).catch((error) =>
      error.status === 404 ? null : Promise.reject(error)
    );
    if (!booking) return Response.json({ error: "Booking not found" }, { status: 404 });
    if (booking.payment_status === "Paid" || booking.payment_status === "Refunded") {
      return Response.json({ error: "This booking is already settled." }, { status: 400 });
    }

    // Amount always comes from the booking record, never from the caller:
    // gift voucher credit and earlier payments reduce what is left to charge.
    const totalNzd = (Number(booking.amount) || 0) * (Number(booking.guests_count) || 1);
    const credited = (Number(booking.voucher_amount) || 0) + (Number(booking.amount_paid) || 0);
    const amountNzd = Math.round(Math.max(0, totalNzd - credited) * 100) / 100;
    if (amountNzd <= 0) {
      return Response.json({ error: "This booking has nothing left to charge." }, { status: 400 });
    }

    const amount = convertFromNzd(amountNzd, code);
    const session = await stripeRequest("/checkout/sessions", {
      params: {
        mode: "payment",
        payment_method_types: isWechat ? ["wechat_pay"] : ["card"],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: code.toLowerCase(),
              unit_amount: toMinorUnits(amount),
              product_data: {
                name: `${booking.booking_ref} · ${booking.guest_name}`,
                description: `${booking.activity || "Resort booking"} · ${booking.visit_date || ""}`,
              },
            },
          },
        ],
        ...(isWechat ? { payment_method_options: { wechat_pay: { client: "web" } } } : {}),
        success_url: `${appUrl}/bookings/${booking.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/bookings/${booking.id}?checkout=cancelled`,
        metadata: {
          base44_app_id: secrets.get("BASE44_APP_ID"),
          booking_id: booking.id,
          booking_ref: booking.booking_ref || "",
        },
      },
      idempotencyKey: crypto.randomUUID(),
    });

    const payment = await base44.entities.StripePayment.create({
      booking_id: booking.id,
      booking_ref: booking.booking_ref || "",
      guest_name: booking.guest_name || "",
      amount,
      currency: code,
      amount_nzd: amountNzd,
      fx_rate: fxRate(code),
      method: isWechat ? "WeChat Pay" : "Card",
      session_id: session.id,
      checkout_url: session.url,
      status: "Pending",
    });

    return Response.json({
      url: session.url,
      session_id: session.id,
      payment_id: payment.id,
      amount,
      currency: code,
      method: isWechat ? "WeChat Pay" : "Card",
    });
  } catch (error) {
    console.log("createStripeCheckout failed", error?.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}