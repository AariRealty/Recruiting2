module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    // Built-in coupon codes
    const coupons = {
      'VIP': { type: 'percent_off', value: 50 },
      'TEST1': { type: 'set_total', value: 1 },
      'AARIVIP100': { type: 'set_total', value: 0 }
    };

    // Additional coupon codes from environment variable
    // Format: CODE1:type:value, CODE2:type:value
    // Types:
    //   waive_all        — waive annual + prorated monthly ($0 due today)
    //   waive_annual     — waive $199 annual compliance fee only
    //   waive_monthly    — waive prorated monthly fee only
    //   percent_off:N    — N% off total due today
    //   flat_off:N       — $N off total due today
    const raw = process.env.COUPON_CODES || '';
    raw.split(',').forEach(function(entry) {
      const parts = entry.trim().split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().toUpperCase();
        const type = parts[1].trim();
        const value = parts[2] ? parseFloat(parts[2].trim()) : 0;
        coupons[key] = { type, value };
      }
    });

    const lookup = code.trim().toUpperCase();
    const coupon = coupons[lookup];

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    // Build response
    var label = '';
    switch (coupon.type) {
      case 'set_total':
        label = 'Total set to $' + coupon.value.toFixed(2) + ' (test)';
        break;
      case 'waive_all':
        label = 'Annual compliance + prorated monthly waived';
        break;
      case 'waive_annual':
        label = '$199 annual compliance fee waived';
        break;
      case 'waive_monthly':
        label = 'Prorated monthly fee waived';
        break;
      case 'percent_off':
        label = coupon.value + '% off total due today';
        break;
      case 'flat_off':
        label = '$' + coupon.value.toFixed(2) + ' off total due today';
        break;
      default:
        return res.status(400).json({ error: 'Invalid coupon configuration' });
    }

    return res.status(200).json({
      valid: true,
      code: lookup,
      type: coupon.type,
      value: coupon.value,
      label: label
    });
  } catch (err) {
    console.error('[validate-coupon] Error:', err.message);
    return res.status(500).json({ error: 'Failed to validate coupon' });
  }
};
