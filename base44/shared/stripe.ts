// Shared Stripe helpers used by the checkout, webhook and refund backend functions.
import { secrets } from "base44:runtime";

export const SUPPORTED_CURRENCIES = ["NZD", "AUD", "TWD", "HKD"];

// WeChat Pay sessions settle in CNY (the only WeChat currency available alongside USD).
export const WECHAT_CURRENCY = "CNY";

// WeChat Pay refunds can only be submitted within 180 days of the original payment.
export const WECHAT_REFUND_WINDOW_DAYS = 180;

// Indicative NZD conversion rates used to present the booking total in the guest's currency.
export const FX_FROM_NZD = { NZD: 1, AUD: 0.92, TWD: 19.6, HKD: 4.75, CNY: 4.35 };

export const fxRate = (currency) =>
  FX_FROM_NZD[String(currency || "").toUpperCase()] || 1;

export const convertFromNzd = (amountNzd, currency) =>
  Math.round((Number(amountNzd) || 0) * fxRate(currency) * 100) / 100;

// All four supported currencies are charged with two decimals.
export const toMinorUnits = (amount) => Math.round((Number(amount) || 0) * 100);

export const daysSince = (iso) => {
  const at = new Date(iso || 0).getTime();
  if (!at) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - at) / 86400000);
};

export const appendParams = (body, value, prefix) => {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      const key = entry && typeof entry === "object" ? `${prefix}[${index}]` : `${prefix}[]`;
      appendParams(body, entry, key);
    });
  } else if (typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) =>
      appendParams(body, entry, prefix ? `${prefix}[${key}]` : key)
    );
  } else {
    body.append(prefix, String(value));
  }
};

// Calls the Stripe REST API with the app's secret key. Throws Stripe's own message on failure.
export async function stripeRequest(path, { method = "POST", params, idempotencyKey } = {}) {
  const key = secrets.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("Stripe is not configured for this app.");

  const headers = {
    Authorization: `Bearer ${key}`,
    "Stripe-Version": "2025-10-29.clover",
  };
  const init = { method, headers, signal: AbortSignal.timeout(15000) };

  if (method !== "GET") {
    const body = new URLSearchParams();
    appendParams(body, params || {}, "");
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = body.toString();
  }
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const response = await fetch(`https://api.stripe.com/v1${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.log("Stripe request failed", path, response.status, data?.error?.message);
    throw new Error(data?.error?.message || `Stripe request failed (${response.status})`);
  }
  return data;
}

// Applies a Stripe refund result to the refund request (and the booking it belongs to).
export async function applyRefundOutcome({ client, refundId, stripeStatus }) {
  const refund = await client.entities.RefundRequest.get(refundId).catch((error) =>
    error.status === 404 ? null : Promise.reject(error)
  );
  if (!refund) return null;

  if (stripeStatus === "succeeded") {
    const isFull = refund.refund_type === "Full";
    await client.entities.RefundRequest.update(refundId, {
      status: "Processed",
      stripe_refund_status: "succeeded",
      processed_at: new Date().toISOString(),
      released: true,
    });
    if (refund.booking_id) {
      const patch = { payment_status: isFull ? "Refunded" : "Partially Paid" };
      if (isFull) patch.booking_status = "Cancelled";
      await client.entities.Booking.update(refund.booking_id, patch);
      if (isFull) {
        const { items } = await client.entities.StripePayment.filter(
          { booking_id: refund.booking_id, status: "Paid" },
          { limit: 5 }
        );
        await Promise.all(
          items.map((payment) =>
            client.entities.StripePayment.update(payment.id, {
              status: "Refunded",
              refunded_at: new Date().toISOString(),
            })
          )
        );
      }
    }
    return "Processed";
  }

  if (stripeStatus === "failed" || stripeStatus === "canceled") {
    await client.entities.RefundRequest.update(refundId, {
      status: "Approved",
      stripe_refund_status: stripeStatus,
      decision_note: `Stripe refund ${stripeStatus}. Please retry or refund manually.`,
    });
    return "Approved";
  }

  await client.entities.RefundRequest.update(refundId, { stripe_refund_status: stripeStatus });
  return "Processing";
}