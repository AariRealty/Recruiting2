const Stripe = require('stripe');
const { computePrice } = require('./_pricing');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { customer_id, payment_method_id, plan_name, addons } = req.body;

    if (!customer_id || !payment_method_id) {
      return res.status(400).json({ error: 'customer_id and payment_method_id are required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    }

    // C1: recurring monthly is computed server-side from the plan + add-ons,
    // never from a client-supplied amount.
    const pricing = computePrice({ plan_name: plan_name, addons: addons });
    if (!pricing.ok) {
      return res.status(400).json({ error: 'Invalid plan selection', detail: pricing.error });
    }
    const serverMonthly = pricing.monthlyAmount;

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    // Attach the payment method to the customer and set as default
    await stripe.paymentMethods.attach(payment_method_id, { customer: customer_id });
    await stripe.customers.update(customer_id, {
      invoice_settings: { default_payment_method: payment_method_id }
    });

    var monthlySubId = null;
    var annualSubId = null;

    // 1. Monthly subscription (brokerage access + add-ons)
    if (serverMonthly > 0) {
      var monthlyDesc = 'Aari Realty Monthly — ' + (plan_name || 'Commission Plan');
      if (addons && addons.length > 0) {
        monthlyDesc += ' + ' + addons.join(', ');
      }

      // Create a Price for the monthly amount
      var monthlyPrice = await stripe.prices.create({
        unit_amount: Math.round(serverMonthly * 100),
        currency: 'usd',
        recurring: { interval: 'month' },
        product_data: { name: monthlyDesc }
      });

      // Start billing on the 1st of next month
      var now = new Date();
      var nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      var billingAnchor = Math.floor(nextMonth.getTime() / 1000);

      var monthlySub = await stripe.subscriptions.create({
        customer: customer_id,
        items: [{ price: monthlyPrice.id }],
        billing_cycle_anchor: billingAnchor,
        proration_behavior: 'none',
        default_payment_method: payment_method_id
      });
      monthlySubId = monthlySub.id;
    }

    // 2. Annual compliance subscription ($199/year starting 1 year from now)
    try {
      var annualPrice = await stripe.prices.create({
        unit_amount: 19900,
        currency: 'usd',
        recurring: { interval: 'year' },
        product_data: { name: 'Aari Realty Annual E&O + Compliance Fee' }
      });

      var oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      var annualAnchor = Math.floor(oneYearFromNow.getTime() / 1000);

      var annualSub = await stripe.subscriptions.create({
        customer: customer_id,
        items: [{ price: annualPrice.id }],
        billing_cycle_anchor: annualAnchor,
        proration_behavior: 'none',
        default_payment_method: payment_method_id
      });
      annualSubId = annualSub.id;
    } catch (annualErr) {
      console.warn('[setup-recurring] Annual subscription failed:', annualErr.message);
    }

    return res.status(200).json({
      success: true,
      monthly_subscription_id: monthlySubId,
      annual_subscription_id: annualSubId
    });
  } catch (err) {
    console.error('[setup-recurring] Error:', err);
    return res.status(500).json({ error: 'Recurring setup failed', detail: err.message });
  }
};
