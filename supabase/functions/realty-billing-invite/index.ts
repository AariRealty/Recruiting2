// Decision 94: after a current agent re signs ICA 5.1 in the Hub, email one private link to save a card.
// Called only by the realty_billing_invite_on_sign trigger (x-aari-cron secret). Charges nothing.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_KEY = Deno.env.get('REALTY_RESEND_API_KEY') ?? Deno.env.get('RESEND_API_KEY') ?? '';
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

// BEGIN TEMPLATE (plain JS so the preview script can render it)
const PLANS = {
  '75_25': { name: 'Mentorship Path 75/25', fee: '$59' },
  '85_15': { name: 'Aari Growth 85/15', fee: '$79' },
  '100_max': { name: 'Aari Max 100%', fee: '$99' }
};
function escH(x) { return String(x == null ? '' : x).replace(/[&<>'"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]; }); }
function billingInviteHtml(o) {
  var p = PLANS[o.plan] || { name: 'your plan', fee: '' };
  var link = 'https://joinaari.com/billing.html?t=' + encodeURIComponent(o.token);
  var top = '<div style="background:#141210;padding:18px 30px"><div style="font-family:Fraunces,Georgia,serif;font-weight:600;font-size:20px;color:#fff">Aari Realty</div><div style="font-size:9.5px;letter-spacing:2px;text-transform:uppercase;color:#a59d90;font-weight:600;margin-top:2px">Florida Licensed Brokerage</div></div>';
  var head = '<div style="padding:34px 30px 4px"><div style="font-size:10px;letter-spacing:2.2px;text-transform:uppercase;color:#b0a06a;font-weight:700">One last step</div>'
    + '<div style="font-family:Fraunces,Georgia,serif;font-weight:600;font-size:30px;line-height:1.05;color:#141210;margin:12px 0 0">Save your card, <span style="font-style:italic;font-weight:500">' + escH(o.first) + '</span>.</div>'
    + '<div style="font-family:Fraunces,Georgia,serif;font-style:italic;font-size:18px;color:#8a7f6a;margin:10px 0 0">Two minutes. Nothing is charged today.</div></div>';
  var para = '<div style="font-size:15px;line-height:1.62;color:#4a453d;padding:18px 30px 0">Your updated agreement is signed. Under it, your plan fee is charged to a card on file. Save yours once and you never think about it again.</div>';
  var rows = '<div style="margin:18px 30px 0;background:#f5f1e8;border-radius:12px;padding:15px 18px;font-size:12.5px;line-height:1.9;color:#2a2620"><div style="font-size:9.5px;letter-spacing:1.8px;text-transform:uppercase;color:#8a7f6a;font-weight:700;margin-bottom:6px">Your plan</div>'
    + '<div><span style="color:#8a857c">Plan</span> &nbsp;' + escH(p.name) + '</div>'
    + '<div><span style="color:#8a857c">Monthly plan fee</span> &nbsp;' + escH(p.fee) + ' a month, first charge ' + escH(o.firstCharge) + '</div>'
    + '<div><span style="color:#8a857c">E&amp;O + Compliance Fee</span> &nbsp;renews ' + escH(o.eoDate) + '</div>'
    + '<div><span style="color:#8a857c">Charged today</span> &nbsp;nothing</div></div>';
  var btn = '<div style="padding:22px 30px 0"><a href="' + link + '" style="display:inline-block;background:#141210;color:#fff;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:1.3px;text-transform:uppercase;padding:14px 28px;border-radius:50px">Save my card</a></div>'
    + '<div style="padding:10px 30px 0;font-size:11.5px;color:#8a857c;line-height:1.5">This link is private to you. Fees are set by Exhibit A and Manual Section 68.1 of your agreement.</div>';
  var sign = '<div style="padding:22px 30px 30px;font-size:14px;color:#4a453d;line-height:1.6">Thank you for keeping it current.<br><br><span style="font-family:Fraunces,Georgia,serif;font-weight:600;color:#141210;font-size:16px">Marlenyi Paredes</span><br><span style="color:#8a857c;font-size:12.5px">Qualifying Broker, Aari Realty LLC</span></div>';
  var foot = '<div style="text-align:center;padding:18px;font-size:11px;color:#a7a29a;line-height:1.6">Aari Realty LLC, Florida Licensed Real Estate Brokerage, License CQ1071216<br>9160 Forum Corporate Pkwy, Suite 350, Fort Myers, FL 33905</div>';
  return '<div style="margin:0;background:#f2f1ef;padding:24px 12px;font-family:Inter,Arial,sans-serif"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #eceae4;border-radius:18px;overflow:hidden">' + top + head + para + rows + btn + sign + '</div>' + foot + '</div>';
}
function fmtDate(d) { return d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }); }
function todayFL() { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
// Decision 103: current Associates are charged on the day of the month they joined, and the E&O on their join anniversary.
function dIn(y, m0) { return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate(); }
function nextMonthDay(startISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(startISO || ''))) return null;
  var t = todayFL(); var y = Number(t.slice(0, 4)), m0 = Number(t.slice(5, 7)) - 1, td = Number(t.slice(8, 10)), jd = Number(String(startISO).slice(8, 10));
  var d = Math.min(jd, dIn(y, m0));
  if (d <= td) { m0++; if (m0 > 11) { m0 = 0; y++; } d = Math.min(jd, dIn(y, m0)); }
  return new Date(Date.UTC(y, m0, d, 16));
}
function nextAnniversary(startISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(startISO || ''))) return null;
  var t = todayFL(); var y = Number(t.slice(0, 4)), m0 = Number(String(startISO).slice(5, 7)) - 1, jd = Number(String(startISO).slice(8, 10));
  var d = Math.min(jd, dIn(y, m0));
  var iso = function (yy, dd) { return yy + '-' + String(m0 + 1).padStart(2, '0') + '-' + String(dd).padStart(2, '0'); };
  if (iso(y, d) <= t) { y++; d = Math.min(jd, dIn(y, m0)); }
  return new Date(Date.UTC(y, m0, d, 16));
}
// END TEMPLATE

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('method_not_allowed', { status: 405 });
  const { data: cfg } = await admin.from('realty_config').select('value').eq('key', 'digest_cron_secret').maybeSingle();
  const secret = (cfg as any)?.value ?? '';
  if (!secret || req.headers.get('x-aari-cron') !== secret) return new Response('forbidden', { status: 403 });
  const body = await req.json().catch(() => ({}));
  const token = String((body as any)?.token ?? '');
  const { data: inv } = await admin.from('realty_billing_invites').select('token,agent_id,email,full_name,emailed_at').eq('token', token).maybeSingle();
  if (!inv) return new Response('not_found', { status: 404 });
  if (inv.emailed_at) return new Response(JSON.stringify({ ok: true, already: true }), { status: 200 });
  const { data: m } = await admin.from('realty_members').select('commission_plan,start_date,fee_exempt,status').eq('user_id', inv.agent_id).maybeSingle();
  if (!m || m.status !== 'active' || m.fee_exempt) return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
  const eo = nextAnniversary(m.start_date); const fc = nextMonthDay(m.start_date);
  const html = billingInviteHtml({ token: inv.token, first: String(inv.full_name || '').split(/\s+/)[0], plan: m.commission_plan, firstCharge: fc ? fmtDate(fc) : 'on your join day', eoDate: eo ? fmtDate(eo) : 'on your anniversary' });
  if (!RESEND_KEY) return new Response('no_email_key', { status: 500 });
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Aari Realty <onboarding@aarirealty.com>', to: [inv.email], bcc: ['join@aarirealty.com'], reply_to: 'marlenyi@aarirealty.com', subject: 'One last step: save your card', html })
  });
  if (!r.ok) return new Response('email_failed: ' + (await r.text()).slice(0, 200), { status: 502 });
  await admin.from('realty_billing_invites').update({ emailed_at: new Date().toISOString() }).eq('token', token);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
