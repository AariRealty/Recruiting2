const payload = require('payload-api');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      customer_id,
      payment_method_id,
      total_due_today,
      monthly_amount,
      plan_name,
      addons
    } = req.body;

    if (!customer_id || !payment_method_id || !total_due_today) {
      return res.status(400).json({ error: 'customer_id, payment_method_id, and total_due_today are required' });
    }

    const pl = payload.Session(process.env.PAYLOAD_SECRET_KEY);

    // 1. Charge the single total amount due today
    const payment = await pl.create(pl.Payment({
      amount: parseFloat(total_due_today),
      customer_id: customer_id,
      payment_method_id: payment_method_id,
      description: 'Aari Realty Onboarding — ' + (plan_name || 'Commission Plan')
    }));

    // 2. Set up recurring monthly billing if there's a monthly amount
    var billingSchedule = null;
    if (monthly_amount && parseFloat(monthly_amount) > 0) {
      // Start recurring on the 1st of next month
      var now = new Date();
      var nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      var startDate = nextMonth.toISOString().split('T')[0]; // YYYY-MM-DD

      var description = 'Monthly Brokerage Access';
      if (addons && addons.length > 0) {
        description += ' + ' + addons.join(', ');
      }

      billingSchedule = await pl.create(pl.BillingSchedule({
        customer_id: customer_id,
        payment_method_id: payment_method_id,
        start_date: startDate,
        frequency: 'monthly',
        charges: [{
          amount: parseFloat(monthly_amount),
          description: description
        }]
      }));
    }

    // 3. Set up annual compliance billing ($199/year)
    var annualStart = new Date();
    annualStart.setFullYear(annualStart.getFullYear() + 1);
    var annualStartDate = annualStart.toISOString().split('T')[0];

    var annualSchedule = null;
    try {
      annualSchedule = await pl.create(pl.BillingSchedule({
        customer_id: customer_id,
        payment_method_id: payment_method_id,
        start_date: annualStartDate,
        frequency: 'yearly',
        charges: [{
          amount: 199.00,
          description: 'Annual E&O + Compliance Fee'
        }]
      }));
    } catch (annualErr) {
      console.warn('[process-payment] Annual schedule creation failed:', annualErr.message);
    }

    return res.status(200).json({
      success: true,
      payment_id: payment.id,
      billing_schedule_id: billingSchedule ? billingSchedule.id : null,
      annual_schedule_id: annualSchedule ? annualSchedule.id : null
    });
  } catch (err) {
    console.error('[process-payment] Error:', err);
    return res.status(500).json({ error: 'Payment failed', detail: err.message });
  }
};
