import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { secrets } from "base44:runtime";
import {
  WECHAT_REFUND_WINDOW_DAYS,
  applyRefundOutcome,
  convertFromNzd,
  daysSince,
  stripeRequest,
  toMinorUnits,
} from "../../shared/stripe.ts";

// Submits a Stripe refund for an approved refund request.
// WeChat Pay refunds are asynchronous: the request stays "Processing" until the webhook confirms.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) =>
      error.status === 401 ? null : Promise.reject(error)
    );
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { refund_id } = await req.json().catch(() => ({}));
    if (!refund_id) return Response.json({ error: "refund_id is required" }, { status: 400 });

    const refund = await base44.entities.RefundRequest.get(refund_id).catch((error) =>
      error.status === 404 ? null : Promise.reject(error)
    );
    if (!refund) return Response.json({ error: "Refund request not found" }, { status: 404 });
    if (refund.status === "Processed" || refund.status === "Processing") {
      return Response.json({ error: "This refund is already with Stripe." }, { status: 400 });
    }
    if (refund.status !== "Approved") {
      return Response.json({ error: "Approve the refund before sending it to Stripe." }, { status: 400 });
    }

    const { items } = await base44.entities.StripePayment.filter(
      { booking_id: refund.booking_id, status: "Paid" },
      { sort: "-created_date", limit: 1 }
    );
    const payment = items[0];
    if (!payment) {
      return Response.json(
        { error: "This booking was not paid through Stripe — refund it manually." },
        { status: 400 }
      );
    }
    if (!payment.payment_intent_id) {
      return Response.json({ error: "Stripe payment reference is missing." }, { status: 400 });
    }

    const isWechat = payment.method === "WeChat Pay";
    if (isWechat && daysSince(payment.paid_at) > WECHAT_REFUND_WINDOW_DAYS) {
      return Response.json(
        {
          error: `WeChat Pay refunds close ${WECHAT_REFUND_WINDOW_DAYS} days after payment. This payment is too old to refund through Stripe.`,
        },
        { status: 400 }
      );
    }

    const requested = toMinorUnits(convertFromNzd(refund.amount, payment.currency));
    const paid = toMinorUnits(payment.amount);
    const amount = Math.min(requested, paid);

    const stripeRefund = await stripeRequest("/refunds", {
      params: {
        payment_intent: payment.payment_intent_id,
        amount,
        metadata: {
          base44_app_id: secrets.get("BASE44_APP_ID"),
          refund_request_id: refund.id,
          booking_id: refund.booking_id,
        },
      },
      idempotencyKey: crypto.randomUUID(),
    });

    await base44.entities.RefundRequest.update(refund.id, {
      status: "Processing",
      stripe_refund_id: stripeRefund.id,
      stripe_refund_status: stripeRefund.status,
      stripe_refund_at: new Date().toISOString(),
      processed_by: user.full_name || user.email || "",
    });

    const outcome = await applyRefundOutcome({
      client: base44,
      refundId: refund.id,
      stripeStatus: stripeRefund.status,
    });

    return Response.json({
      refund_id: stripeRefund.id,
      stripe_status: stripeRefund.status,
      status: outcome,
    });
  } catch (error) {
    console.log("createStripeRefund failed", error?.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}