const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async function handler(req, res) {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true
    });
    const page = await browser.newPage();
    await page.goto('https://joinaari.com/ica-print.html', { waitUntil: 'networkidle0', timeout: 45000 });
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Aari-Realty-ICA.pdf"');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(Buffer.from(pdf));
  } catch (err) {
    console.error('ica-pdf error:', err);
    return res.status(500).json({ error: 'Failed to generate PDF', detail: String(err && err.message) });
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
  }
};
