import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { secrets } from "base44:runtime";
import { applyRefundOutcome } from "../../shared/stripe.ts";

const encoder = new TextEncoder();

const hex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

// Verifies the Stripe-Signature header (t=…,v1=…) against the raw request body.
async function verifySignature(payload, header, secret) {
  if (!header) return false;
  const parts = header.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = hex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)));
  return signatures.some((signature) => signature === digest);
}

const methodOf = (session) =>
  (session.payment_method_types || []).includes("wechat_pay") ? "WeChat Pay" : "Card";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();

    const secret = secrets.get("STRIPE_WEBHOOK_SECRET");
    if (!secret) {
      console.log("stripeWebhook: STRIPE_WEBHOOK_SECRET is not set");
      return Response.json({ error: "Webhook not configured" }, { status: 500 });
    }
    const valid = await verifySignature(body, req.headers.get("Stripe-Signature"), secret);
    if (!valid) return Response.json({ error: "Invalid signature" }, { status: 400 });

    const event = JSON.parse(body);
    const object = event?.data?.object || {};
    const metadata = object.metadata || {};

    // Base44's own self-test charge must never touch customer orders.
    if (metadata.base44_test_checkout === "true") {
      return Response.json({ received: true });
    }

    const admin = base44.asServiceRole;

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded" ||
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const { items } = await admin.entities.StripePayment.filter(
        { session_id: object.id },
        { limit: 1 }
      );
      const payment = items[0];
      if (!payment) return Response.json({ received: true });

      if (event.type === "checkout.session.expired") {
        await admin.entities.StripePayment.update(payment.id, { status: "Expired" });
        return Response.json({ received: true });
      }

      if (event.type === "checkout.session.async_payment_failed") {
        await admin.entities.StripePayment.update(payment.id, {
          status: "Failed",
          payment_intent_id: object.payment_intent || "",
        });
        return Response.json({ received: true });
      }

      // checkout.session.completed can still be unpaid — wait for confirmed payment.
      if (object.payment_status !== "paid") {
        await admin.entities.StripePayment.update(payment.id, {
          payment_intent_id: object.payment_intent || "",
          note: "Awaiting confirmed payment",
        });
        return Response.json({ received: true });
      }

      await admin.entities.StripePayment.update(payment.id, {
        status: "Paid",
        payment_intent_id: object.payment_intent || "",
        paid_at: new Date().toISOString(),
      });

      const method = methodOf(object);
      const booking = await admin.entities.Booking.get(payment.booking_id).catch(() => null);
      const totalNzd = (Number(booking?.amount) || 0) * (Number(booking?.guests_count) || 1);
      const paidNzd = (Number(booking?.amount_paid) || 0) + (Number(payment.amount_nzd) || 0);
      const voucherNzd = Number(booking?.voucher_amount) || 0;
      const settled = totalNzd > 0 && paidNzd + voucherNzd >= totalNzd - 0.01;

      await admin.entities.Booking.update(payment.booking_id, {
        payment_status: settled ? "Paid" : "Partially Paid",
        payment_method: method === "WeChat Pay" ? "WeChat Pay" : "Card",
        amount_paid: paidNzd,
        payment_terms: "Pay now",
        ...(settled ? { payment_due_date: "" } : {}),
      });
      return Response.json({ received: true });
    }

    if (event.type === "refund.updated" || event.type === "charge.refund.updated") {
      const refundRequestId = metadata.refund_request_id;
      if (!refundRequestId) return Response.json({ received: true });
      await applyRefundOutcome({
        client: admin,
        refundId: refundRequestId,
        stripeStatus: object.status,
      });
      return Response.json({ received: true });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.log("stripeWebhook failed", error?.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}