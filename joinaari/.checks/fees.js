// Decision 141: fee amounts and payout math live only in Exhibit A. This check fails the deploy when the
// ICA, CSA (outside Exhibit A), Manual or acknowledgments state a dollar amount, a percentage or a payout
// calculation that is not on the reviewed allowlist below.
const path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'ica-content.js'));
const C = window.ICA_CONTENT;
const ALLOW = [
  /fifty percent \(50%\) of any single commission disbursement/,
  /offsets exceeding fifty percent \(50%\)/,
  /exceeds fifty percent \(50%\) of the total commission/,
  /includes 50%\+ ownership/,
  /at least \$100,000 per person \/ \$300,000 per accident/,
];
const HIT = /[^.]{0,80}(\$\s?\d[\d,.]*|\b\d+(\.\d+)?\s?%|less the Administrative Fee|share under the Associate.s commission plan)[^.]{0,60}/g;
let bad = [];
for (const k of Object.keys(C)) {
  let t = C[k];
  if (k === 'commission') { const i = t.indexOf('EXHIBIT A: COMMISSION FEE SCHEDULE'); if (i < 0) { console.error('Exhibit A marker missing'); process.exit(1); } const j = t.indexOf('OPERATIONS & COMPLIANCE MANUAL', i); t = t.slice(0, i) + (j > 0 ? t.slice(j) : ''); }
  const txt = t.replace(/<[^>]+>/g, ' ').replace(/&rsquo;/g, "'").replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
  let m; while ((m = HIT.exec(txt))) { const s = m[0]; if (!ALLOW.some(a => a.test(s))) bad.push(k + ': ' + s.trim()); }
}
if (bad.length) { console.error('Fee amount or payout math outside Exhibit A (decision 141). Move it to Exhibit A or reference Exhibit A:'); bad.forEach(b => console.error('  ' + b)); process.exit(1); }

// Decision 149: fee TIMING lives only in Manual 68.1. Fail if Exhibit A states when a fee is charged.
{
  const t = C.commission; const i = t.indexOf('EXHIBIT A: COMMISSION FEE SCHEDULE'); const j = t.indexOf('OPERATIONS & COMPLIANCE MANUAL', i);
  const ex = (j > 0 ? t.slice(i, j) : t.slice(i)).replace(/<[^>]+>/g, ' ').replace(/&rsquo;/g, "'").replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
  const T = /[^.]{0,80}\b(is charged (on|beginning|when|at)|charged beginning on|billing day|charged on the)\b[^.]{0,60}/gi;
  let m, tb = []; while ((m = T.exec(ex))) tb.push(m[0].trim());
  if (tb.length) { console.error('Fee timing stated in Exhibit A (decision 149). Move it to Manual 68.1:'); tb.forEach(x => console.error('  ' + x)); process.exit(1); }
}
console.log('fees check passed');
