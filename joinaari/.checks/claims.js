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
  /99\s*\*\s*11/
];
const files = fs.readdirSync(root).filter(f => /\.(html|js)$/.test(f)).map(f => path.join(root, f))
  .concat(fs.readdirSync(path.join(root, 'api')).filter(f => f.endsWith('.js')).map(f => path.join(root, 'api', f)));
let bad = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => banned.forEach(re => { if (re.test(l)) bad.push(path.relative(root, f) + ':' + (i + 1) + '  ' + re); }));
}
if (bad.length) { console.error('Retired billing claim found (decision 110). Fix before deploy:\n' + bad.join('\n')); process.exit(1); }
console.log('claims check passed: ' + files.length + ' files');
