import { chromium } from 'playwright';
import fs from 'fs';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

page.on('console', msg => console.log('PAGE:', msg.text()));
page.on('pageerror', err => console.log('ERR:', err.message));

const raw = fs.readFileSync('/root/.claude/projects/-home-user-Recruiting2/3a5281a3-d783-5123-aede-0ee15e73313d/tool-results/artifact-1a67937d-1787453562-f651.html', 'utf8');
const tmpFile = '/tmp/quiz-test.html';
fs.writeFileSync(tmpFile, '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' + raw + '</body></html>');

await page.goto('file://' + tmpFile, { waitUntil: 'load' });
await page.waitForTimeout(1500);

// Check JS loaded
const fnCheck = await page.evaluate(() => [typeof pickOne, typeof goTo, typeof showResult].join(', '));
console.log('Functions:', fnCheck);

// Screen 1: pick second option (growth)
await page.evaluate(() => {
  const cards = document.querySelectorAll('#s1 .dh-option');
  if (cards[1]) pickOne(cards[1], 's1');
});
await page.waitForTimeout(500);

// Tap slider 1 to advance
await page.evaluate(() => {
  const track = document.getElementById('sl1');
  if (track) {
    track.classList.add('live');
    track.click();
  }
});
await page.waitForTimeout(800);

// Screen 2: pick second option (growth)
await page.evaluate(() => {
  const cards = document.querySelectorAll('#s2 .dh-option');
  if (cards[1]) pickOne(cards[1], 's2');
});
await page.waitForTimeout(500);
await page.evaluate(() => {
  const track = document.getElementById('sl2');
  if (track) { track.classList.add('live'); track.click(); }
});
await page.waitForTimeout(800);

// Screen 3: pick second option (growth)
await page.evaluate(() => {
  const cards = document.querySelectorAll('#s3 .dh-option');
  if (cards[1]) pickOne(cards[1], 's3');
});
await page.waitForTimeout(500);
await page.evaluate(() => {
  const track = document.getElementById('sl3');
  if (track) { track.classList.add('live'); track.click(); }
});
await page.waitForTimeout(800);

// Screen 4: pick second option (growth)
await page.evaluate(() => {
  const cards = document.querySelectorAll('#s4 .dh-option');
  if (cards[1]) pickOne(cards[1], 's4');
});
await page.waitForTimeout(500);
await page.evaluate(() => {
  const track = document.getElementById('sl4');
  if (track) { track.classList.add('live'); track.click(); }
});
await page.waitForTimeout(1500);

// Check result screen
const result = await page.evaluate(() => {
  return {
    split: document.getElementById('resSplit')?.textContent,
    name: document.getElementById('resName')?.textContent,
    eyebrow: document.querySelector('.res-eyebrow')?.textContent,
    tagline: document.getElementById('resTagline')?.textContent,
    activeScreen: document.querySelector('.screen.active')?.id,
    want100visible: document.getElementById('btnWant100')?.style.display !== 'none'
  };
});
console.log('Result:', JSON.stringify(result, null, 2));

if (result.split === '85/15' && result.name === 'Aari Growth') {
  console.log('PASS: Got 85/15 Growth plan as expected');
} else {
  console.log('FAIL: Expected 85/15 Growth, got', result.split, result.name);
}

// Test "I just want 100%" button
await page.evaluate(() => showWhatYouLose());
await page.waitForTimeout(5000);

const afterReveal = await page.evaluate(() => {
  return {
    split: document.getElementById('resSplit')?.textContent,
    name: document.getElementById('resName')?.textContent,
    giveupVisible: document.getElementById('resGiveup')?.style.display !== 'none'
  };
});
console.log('After 100% reveal:', JSON.stringify(afterReveal, null, 2));

if (afterReveal.split === '100%' && afterReveal.name === 'Aari Max') {
  console.log('PASS: 100% reveal worked correctly');
} else {
  console.log('FAIL: Expected 100% Aari Max after reveal');
}

await page.screenshot({ path: '/tmp/quiz-result.png', fullPage: true });
console.log('Screenshot saved to /tmp/quiz-result.png');

await browser.close();
console.log('All tests complete');
