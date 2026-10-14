// Decision 110 (12 Oct 2026): the joinaari.com deploy fails if a retired billing claim comes back.
// Current rule (decisions 100 to 103): $199 E&O at signing, plan fee from the Start Date on the agent's own day. No free month, no 1st of the month.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const banned = [
  /skip this month'?s plan fee/i,
  /plan fee this month/i,
  /billing starts the 1st/i,
  /month is free/i,
  /first month (is )?(waived|free)/i,
  /waives? (your|the) first month/i,
  /on the 1st of (each|every|the) month/i,
  /11 monthly fees/i,
  /99\s*\*\s*11/,
  /keep 100% at/i,
  /Keep up to 100%\.</i,
  /100% yours/i,
  /whole check/i,
  /100%(<br>|\s)+Commission</i,
  // Decisions 281 to 288 (re scan 11).
  /100% of nothing/i,
  /protection you'?ll be glad/i,
  /100% commission/i,
  /not used for model training/i,
  /Aari Realty LLC &middot; License BK/,
  /signed agreement and your receipt come by email/i,
  /"Effective" date above reflects/i,
  // Decisions 301 and 322 to 327 (re scan 12).
  /Violation means immediate termination/i,
  /shouldn't cost your license/i,
  /left to sink/i,
  /a desk, a login/i,
  /Most agents spend months/i,
  /so you stay compliant/i,
  // Decisions 374 and 376 (re scan 13).
  /if you choose to upload a photo of your real estate license/i,
  /Start where you are, move up as you grow/i,
  // Ripples of 288 and 150 (re scan 14).
  /Your signed agreement is in your inbox now/i,
  /\/\/ Decision 2[0-9][0-9]:/,
  // Decision 387a: WhatsApp links are labeled WhatsApp.
  /wa\.me\/[^"']*"[^>]*>[^<]*Text the Aari team/i,
];
const files = fs.readdirSync(root).filter(f => /\.(html|js)$/.test(f)).map(f => path.join(root, f))
  .concat(fs.readdirSync(path.join(root, 'api')).filter(f => f.endsWith('.js')).map(f => path.join(root, 'api', f)));
let bad = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => banned.forEach(re => { if (re.test(l)) bad.push(path.relative(root, f) + ':' + (i + 1) + '  ' + re); }));
}
// Decision 120: preview and sample data never use a real agent's name.
const agents = /(Alejandro|Alied|Eileen|Flavia|Milennys|Odalis|Roosevelt)/;
for (const f of files) {
  fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => { if (/preview|sample|mock/i.test(l) && agents.test(l)) bad.push(path.relative(root, f) + ':' + (i + 1) + '  real agent name in preview data'); });
}
// Decision 157: no signature image may sit in the public site.
for (const n of fs.readdirSync(root)) if (/signature/i.test(n) && /\.(png|jpe?g|gif|svg|webp)$/i.test(n)) bad.push(n + '  signature image in public site (decision 157)');
// Decision 161: the ICA is labeled by its date, never a version number, and every surface shows the same date.
{ const ic = fs.readFileSync(path.join(root, 'ica-content.js'), 'utf8'), pr = fs.readFileSync(path.join(root, 'ica-print.html'), 'utf8');
  if (/ICA Version \d|Version \d+\.\d+ &middot;/.test(ic + pr)) bad.push('ica-content.js/ica-print.html  version number label (decision 161)');
  const dates = new Set([...(ic + pr).matchAll(/ICA dated ([A-Z][a-z]+ \d{1,2}, \d{4})/g)].map(m => m[1]));
  if (dates.size !== 1) bad.push('ICA date label differs across surfaces: ' + [...dates].join(' / ') + ' (decision 161)'); }
// Decision 172: newer agents start on Mentorship, so no "no tiers", "nothing to unlock" or "yours from day one" claims.
for (const f of files) { const t = fs.readFileSync(f, 'utf8'); if (/nothing to unlock|yours from day one|\bno tiers\b/i.test(t)) bad.push(path.relative(root, f) + '  plan claim conflicts with the Mentorship start rule (decision 172)'); }
// Decisions 187 to 189: no outcome promises or personal promises in recruiting copy and chatbot.
for (const f of files) { const t = fs.readFileSync(f, 'utf8'); const m = t.match(/ends careers|every file (is )?reviewed by your broker|reviews every file|personally reviews your files|Text Marlenyi directly|never have a compliance headache|compliance review on every|career-ending|>Text Marlenyi<|Call Marlenyi|text the broker directly|forwarded our whole conversation to Marlenyi|signed and paid|First 3 residential sales guided|no fine print|no surprise fees|takes like 2 minutes|Easy money for a warm intro|No recruiting to get paid|she is actually available to you|a broker who actually picks up|Evenings and weekends\? Just ask|reads every file|the second you enter your effective date|Hi%20Marlenyi|the day your license moves|You are in, <em>|license, <em>you&rsquo;re in|Florida real person|Aari Transactions, billed at closing|<h2>Not agents|every Aari partner signs|turn on once your license transfer to Aari shows in DBPR|Absolutely\. Just get broker approval|a broker who actually answers|Get a broker who<br>actually|everything here will be waiting for you|Meet Your Future Broker|Pay &amp; Join|Pay & Join|You earn a referral fee when the deal closes\.|call us at <b>239\.789|sign for moving|Card saved\. \$0 charged|once your license transfer to Aari shows in DBPR|billed monthly\. |with your future broker|I just sent Marlenyi|We are waiving \$199|Fee each year on your Start Date|Hub turns on with your transfer|\|\| 'succeeded';|>Meet the Broker<|A broker who answers, compliance first|near misses I catch on real files|Every contract you submit, checked|contract reviewed by the broker|you are responsible for the deductible\.|on the hook for the deductible|to finish joining|Experienced agents pick their plan|move up as you close/i); if (m) bad.push(path.relative(root, f) + '  ' + m[0] + ' (decisions 187 to 189)'); }
// Decision 190: the chatbot E&O answer keeps the Personal Transactions exclusion.
for (const f of files) { const t = fs.readFileSync(f, 'utf8'); if (/How does E&O insurance work|E and O policy covering professional services/.test(t) && !/Personal Transactions are not covered/.test(t)) bad.push(path.relative(root, f) + '  E&O answer missing Personal Transactions exclusion (decision 190)'); }
// Decision 232: the independent contractor line stays with the Business Partners label.
{ const ix2 = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); if (/Aari Business Partners/.test(ix2) && !/independent contractors, not partners or owners of Aari Realty LLC/.test(ix2)) bad.push('index.html  Business Partners label without the independent contractor line (decision 232)'); }
// Decision 247: the decline right before Active is shown on the thank you page.
{ const ty = fs.readFileSync(path.join(root, 'thank-you.html'), 'utf8'); if (!/subject to broker review and acceptance before you become Active/.test(ty)) bad.push('thank-you.html  decline right line missing (decision 247)'); }
// Decision 260: the stored e sign consent is the exact visible text.
{ const ic2 = fs.readFileSync(path.join(root, 'ica.html'), 'utf8'); if (/consent_text: "I agree to sign this Independent Contractor Agreement/.test(ic2) || !/function _consentTextNow/.test(ic2)) bad.push('ica.html  consent record does not match the visible consent (decision 260)'); }
// Decision 216: named agent testimonials stay hidden until each written release is on file.
{ const ix = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); if (/<section class="testi" id="agents">/.test(ix)) bad.push('index.html  testimonial section shown before releases are on file (decision 216)'); if (!/Jose Alejandro Paredes<\/div><div class="rl">Aari Realty Agent and family member/.test(ix)) bad.push('index.html  family tie label missing (decision 216)'); if (/still no surprises/i.test(ix)) bad.push('index.html  still no surprises (decision 216)'); }
// Re scan 15 (decision 13 ripple): the broker email shows the REALTOR association answer, not how they heard about us.
{ const bs = fs.readFileSync(path.join(root, 'api', 'send-broker-summary.js'), 'utf8'); if (/row\('REALTOR Association', esc\(how_did_you_hear\)\)/.test(bs)) bad.push('api/send-broker-summary.js  REALTOR Association row shows the wrong field (decision 13)'); }
// Decision 410: one payout clock after a cure (ICA 7); ICA 8, CSA 23(b) and Manual 50 point to it.
{ const ic = fs.readFileSync(path.join(root, 'ica-content.js'), 'utf8'); if (/thirty \(30\) days of the Associate curing|completion of the required action, disbursement shall be released within three \(3\) business days/.test(ic)) bad.push('ica-content.js  payout timing after cure must follow Section 7 (decision 410)'); }
if (bad.length) { console.error('Retired billing claim found (decision 110). Fix before deploy:\n' + bad.join('\n')); process.exit(1); }
console.log('claims check passed: ' + files.length + ' files');
