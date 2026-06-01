// ============================================================================
// Aari Realty — Stripe webhook: automatic late fees
// Fires when a recurring subscription payment fails. After Stripe has
// exhausted its automatic retries (final failure), this adds a one-time
// $25 Late Fee to the customer's NEXT invoice — once per missed cycle.
//
// Setup (see runbook):
//   1. Stripe → Developers → Webhooks → Add endpoint
//        URL:    https://joinaari.com/api/stripe-webhook
//        Events: invoice.payment_failed
//   2. Copy the endpoint's Signing secret → Vercel env STRIPE_WEBHOOK_SECRET
//   3. Late Fee product: prod_TicGOmWWvqNL7o (active price resolved at runtime)
//
// Defaults (change here if business rules change):
//   - Trigger: only when Stripe will NOT retry again (invoice.next_payment_attempt === null)
//   - One fee per failed invoice (idempotent via invoice metadata)
//   - Lands on the customer's next invoice
//   - Notifies the agent + broker by email (Resend)
// ============================================================================

const Stripe = require('stripe');
const { Resend } = require('resend');

const LATE_FEE_PRODUCT_ID = 'prod_TicGOmWWvqNL7o';
const BROKER_EMAIL = 'join@aarirealty.com';

// Stripe signature verification needs the RAW request body (parsing disabled
// via the config export at the bottom of this file).
function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    // If the platform already gave us the raw bytes, use them.
    if (Buffer.isBuffer(req.body)) return resolve(req.body);
    if (typeof req.body === 'string') return resolve(Buffer.from(req.body));
    const chunks = [];
    req.on('data', function (c) { chunks.push(typeof c === 'string' ? Buffer.from(c) : c); });
    req.on('end', function () { resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe-webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  // 1) Verify the event came from Stripe (signature + raw body).
  let event;
  try {
    const raw = await readRawBody(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // 2) Only act on final failed-payment events.
  if (event.type !== 'invoice.payment_failed') {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  try {
    const invoice = event.data.object;

    // Skip if Stripe will still retry — wait until retries are exhausted.
    if (invoice.next_payment_attempt) {
      return res.status(200).json({ received: true, note: 'retry pending, no fee yet' });
    }

    // Idempotency: never add a second late fee for the same failed invoice.
    if (invoice.metadata && invoice.metadata.late_fee_applied === 'true') {
      return res.status(200).json({ received: true, note: 'late fee already applied' });
    }

    // Don't apply a late fee to a late-fee/one-off invoice with no subscription.
    if (!invoice.subscription) {
      return res.status(200).json({ received: true, note: 'non-subscription invoice, skipped' });
    }

    // Resolve the active Late Fee price from the product.
    const prices = await stripe.prices.list({ product: LATE_FEE_PRODUCT_ID, active: true, limit: 1 });
    if (!prices.data.length) {
      console.error('[stripe-webhook] No active price on Late Fee product', LATE_FEE_PRODUCT_ID);
      return res.status(500).json({ error: 'Late fee price not found' });
    }
    const lateFeePrice = prices.data[0];

    // Add the late fee to the customer's NEXT invoice.
    await stripe.invoiceItems.create(
      {
        customer: invoice.customer,
        price: lateFeePrice.id,
        description: 'Late fee — missed payment for invoice ' + invoice.number,
        metadata: { reason: 'late_payment', source_invoice: invoice.id },
      },
      { idempotencyKey: 'latefee_' + invoice.id }
    );

    // Mark the failed invoice so we never double-charge.
    await stripe.invoices.update(invoice.id, { metadata: { late_fee_applied: 'true' } });

    // Notify the agent + broker (best-effort; never fail the webhook on email).
    if (process.env.RESEND_API_KEY && invoice.customer_email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const amount = (lateFeePrice.unit_amount / 100).toFixed(2);
        await resend.emails.send({
          from: 'Aari Realty <noreply@aarirealty.com>',
          to: invoice.customer_email,
          cc: BROKER_EMAIL,
          subject: 'Aari Realty — Late fee applied to your account',
          html:
            '<div style="font-family:Arial,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto">' +
            '<p>Hi' + (invoice.customer_name ? ' ' + invoice.customer_name : '') + ',</p>' +
            '<p>A recent payment on your Aari Realty account could not be completed after our retries, ' +
            'so a <strong>$' + amount + ' late fee</strong> has been added to your next invoice, ' +
            'per your Independent Contractor Agreement (Exhibit A).</p>' +
            '<p>To avoid further fees, please make sure a valid card is on file. ' +
            'Questions? Reply to this email or call (239) 688-1770.</p>' +
            '<p style="color:#888;font-size:12px;margin-top:24px">Aari Realty LLC · ' +
            '9160 Forum Corporate Pkwy Suite 350, Fort Myers, FL 33905</p>' +
            '</div>',
        });
      } catch (mailErr) {
        console.warn('[stripe-webhook] Late-fee email failed:', mailErr.message);
      }
    }

    return res.status(200).json({ received: true, late_fee_applied: true });
  } catch (err) {
    console.error('[stripe-webhook] Error applying late fee:', err.message);
    // Return 200 so Stripe doesn't hammer retries on our own bug; we logged it.
    return res.status(200).json({ received: true, error: err.message });
  }
};

module.exports.config = { api: { bodyParser: false } };
