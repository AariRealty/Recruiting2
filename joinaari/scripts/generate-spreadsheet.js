var ExcelJS = require('exceljs');
var path = require('path');
var fs = require('fs');

async function main() {
  var wb = new ExcelJS.Workbook();
  wb.creator = 'Aari Realty LLC';
  var ws = wb.addWorksheet('Cost Comparison');

  ws.columns = [
    { width: 28 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
  ];

  var hdrFont = { name: 'Calibri', size: 12, bold: true };
  var lblFont = { name: 'Calibri', size: 11 };
  var numFont = { name: 'Calibri', size: 11 };
  var bigFont = { name: 'Calibri', size: 13, bold: true };
  var currency = '$#,##0.00';
  var pct = '0.00%';
  var integer = '#,##0';
  var border = { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } };

  // Title
  ws.mergeCells('A1:D1');
  var c1 = ws.getCell('A1');
  c1.value = 'Real Estate Agent Cost Comparison';
  c1.font = { name: 'Calibri', size: 16, bold: true };
  c1.alignment = { horizontal: 'left' };

  ws.mergeCells('A2:D2');
  var c2 = ws.getCell('A2');
  c2.value = 'Edit the yellow cells to see your numbers.';
  c2.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF888888' } };

  // Section: Deal Assumptions
  ws.getCell('A4').value = 'Deal Assumptions';
  ws.getCell('A4').font = hdrFont;
  ws.getCell('A4').border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };
  ws.getCell('B4').border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };

  var inputFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFDE7' } };

  ws.getCell('A5').value = 'Average sale price';
  ws.getCell('A5').font = lblFont;
  ws.getCell('B5').value = 400000;
  ws.getCell('B5').numFmt = currency;
  ws.getCell('B5').font = numFont;
  ws.getCell('B5').fill = inputFill;
  ws.getCell('B5').border = border;

  ws.getCell('A6').value = 'Commission rate';
  ws.getCell('A6').font = lblFont;
  ws.getCell('B6').value = 0.03;
  ws.getCell('B6').numFmt = pct;
  ws.getCell('B6').font = numFont;
  ws.getCell('B6').fill = inputFill;
  ws.getCell('B6').border = border;

  ws.getCell('A7').value = 'Deals per year';
  ws.getCell('A7').font = lblFont;
  ws.getCell('B7').value = 12;
  ws.getCell('B7').numFmt = integer;
  ws.getCell('B7').font = numFont;
  ws.getCell('B7').fill = inputFill;
  ws.getCell('B7').border = border;

  // Section: Brokerage Costs
  ws.getCell('A9').value = 'Brokerage Costs';
  ws.getCell('A9').font = hdrFont;
  ws.getCell('A9').border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };
  ws.getCell('B9').value = 'Your Brokerage';
  ws.getCell('B9').font = hdrFont;
  ws.getCell('B9').alignment = { horizontal: 'center' };
  ws.getCell('B9').border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };
  ws.getCell('C9').value = 'Aari Realty';
  ws.getCell('C9').font = hdrFont;
  ws.getCell('C9').alignment = { horizontal: 'center' };
  ws.getCell('C9').border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };

  var rows = [
    { label: 'Agent split', yours: 0.70, aari: 1.00, fmt: pct },
    { label: 'Monthly fee', yours: 200, aari: 99, fmt: currency },
    { label: 'E&O / compliance (annual)', yours: 500, aari: 199, fmt: currency },
    { label: 'Transaction fee (per deal)', yours: 400, aari: 499, fmt: currency },
    { label: 'Franchise fee (% of gross)', yours: 0.06, aari: 0, fmt: pct },
    { label: 'Technology fee (monthly)', yours: 50, aari: 0, fmt: currency },
  ];

  rows.forEach(function (r, i) {
    var row = 10 + i;
    ws.getCell('A' + row).value = r.label;
    ws.getCell('A' + row).font = lblFont;
    ws.getCell('B' + row).value = r.yours;
    ws.getCell('B' + row).numFmt = r.fmt;
    ws.getCell('B' + row).font = numFont;
    ws.getCell('B' + row).fill = inputFill;
    ws.getCell('B' + row).border = border;
    ws.getCell('C' + row).value = r.aari;
    ws.getCell('C' + row).numFmt = r.fmt;
    ws.getCell('C' + row).font = numFont;
    ws.getCell('C' + row).border = border;
  });

  // Section: Per-Deal Breakdown
  var S = 17;
  ws.getCell('A' + S).value = 'Per-Deal Breakdown';
  ws.getCell('A' + S).font = hdrFont;
  ws.getCell('A' + S).border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };
  ws.getCell('B' + S).value = 'Your Brokerage';
  ws.getCell('B' + S).font = hdrFont;
  ws.getCell('B' + S).alignment = { horizontal: 'center' };
  ws.getCell('B' + S).border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };
  ws.getCell('C' + S).value = 'Aari Realty';
  ws.getCell('C' + S).font = hdrFont;
  ws.getCell('C' + S).alignment = { horizontal: 'center' };
  ws.getCell('C' + S).border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };

  // Gross commission = sale price × commission rate
  ws.getCell('A18').value = 'Gross commission';
  ws.getCell('A18').font = lblFont;
  ws.getCell('B18').value = { formula: 'B5*B6' };
  ws.getCell('B18').numFmt = currency;
  ws.getCell('B18').font = numFont;
  ws.getCell('B18').border = border;
  ws.getCell('C18').value = { formula: 'B5*B6' };
  ws.getCell('C18').numFmt = currency;
  ws.getCell('C18').font = numFont;
  ws.getCell('C18').border = border;

  // After split
  ws.getCell('A19').value = 'After split';
  ws.getCell('A19').font = lblFont;
  ws.getCell('B19').value = { formula: 'B18*B10' };
  ws.getCell('B19').numFmt = currency;
  ws.getCell('B19').font = numFont;
  ws.getCell('B19').border = border;
  ws.getCell('C19').value = { formula: 'C18*C10' };
  ws.getCell('C19').numFmt = currency;
  ws.getCell('C19').font = numFont;
  ws.getCell('C19').border = border;

  // Franchise cost
  ws.getCell('A20').value = 'Franchise fee';
  ws.getCell('A20').font = lblFont;
  ws.getCell('B20').value = { formula: 'B18*B14' };
  ws.getCell('B20').numFmt = currency;
  ws.getCell('B20').font = numFont;
  ws.getCell('B20').border = border;
  ws.getCell('C20').value = { formula: 'C18*C14' };
  ws.getCell('C20').numFmt = currency;
  ws.getCell('C20').font = numFont;
  ws.getCell('C20').border = border;

  // Net per deal
  ws.getCell('A21').value = 'Net per deal';
  ws.getCell('A21').font = bigFont;
  ws.getCell('B21').value = { formula: 'B19-B20-B13' };
  ws.getCell('B21').numFmt = currency;
  ws.getCell('B21').font = bigFont;
  ws.getCell('B21').border = { bottom: { style: 'double', color: { argb: 'FF141210' } } };
  ws.getCell('C21').value = { formula: 'C19-C20-C13' };
  ws.getCell('C21').numFmt = currency;
  ws.getCell('C21').font = bigFont;
  ws.getCell('C21').border = { bottom: { style: 'double', color: { argb: 'FF141210' } } };

  // Section: Annual Summary
  var A = 23;
  ws.getCell('A' + A).value = 'Annual Summary';
  ws.getCell('A' + A).font = hdrFont;
  ws.getCell('A' + A).border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };
  ws.getCell('B' + A).value = 'Your Brokerage';
  ws.getCell('B' + A).font = hdrFont;
  ws.getCell('B' + A).alignment = { horizontal: 'center' };
  ws.getCell('B' + A).border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };
  ws.getCell('C' + A).value = 'Aari Realty';
  ws.getCell('C' + A).font = hdrFont;
  ws.getCell('C' + A).alignment = { horizontal: 'center' };
  ws.getCell('C' + A).border = { bottom: { style: 'medium', color: { argb: 'FF141210' } } };

  // Total deal income
  ws.getCell('A24').value = 'Total deal income';
  ws.getCell('A24').font = lblFont;
  ws.getCell('B24').value = { formula: 'B21*B7' };
  ws.getCell('B24').numFmt = currency;
  ws.getCell('B24').font = numFont;
  ws.getCell('B24').border = border;
  ws.getCell('C24').value = { formula: 'C21*B7' };
  ws.getCell('C24').numFmt = currency;
  ws.getCell('C24').font = numFont;
  ws.getCell('C24').border = border;

  // Monthly fees × 12
  ws.getCell('A25').value = 'Monthly fees (×12)';
  ws.getCell('A25').font = lblFont;
  ws.getCell('B25').value = { formula: '(B11+B15)*12' };
  ws.getCell('B25').numFmt = currency;
  ws.getCell('B25').font = numFont;
  ws.getCell('B25').border = border;
  ws.getCell('C25').value = { formula: '(C11+C15)*12' };
  ws.getCell('C25').numFmt = currency;
  ws.getCell('C25').font = numFont;
  ws.getCell('C25').border = border;

  // E&O annual
  ws.getCell('A26').value = 'E&O / compliance';
  ws.getCell('A26').font = lblFont;
  ws.getCell('B26').value = { formula: 'B12' };
  ws.getCell('B26').numFmt = currency;
  ws.getCell('B26').font = numFont;
  ws.getCell('B26').border = border;
  ws.getCell('C26').value = { formula: 'C12' };
  ws.getCell('C26').numFmt = currency;
  ws.getCell('C26').font = numFont;
  ws.getCell('C26').border = border;

  // Total annual fees
  ws.getCell('A27').value = 'Total annual fees';
  ws.getCell('A27').font = lblFont;
  ws.getCell('B27').value = { formula: 'B25+B26' };
  ws.getCell('B27').numFmt = currency;
  ws.getCell('B27').font = numFont;
  ws.getCell('B27').border = border;
  ws.getCell('C27').value = { formula: 'C25+C26' };
  ws.getCell('C27').numFmt = currency;
  ws.getCell('C27').font = numFont;
  ws.getCell('C27').border = border;

  // Annual take-home
  ws.getCell('A28').value = 'Annual take-home';
  ws.getCell('A28').font = bigFont;
  ws.getCell('B28').value = { formula: 'B24-B27' };
  ws.getCell('B28').numFmt = currency;
  ws.getCell('B28').font = bigFont;
  ws.getCell('B28').border = { bottom: { style: 'double', color: { argb: 'FF141210' } } };
  ws.getCell('C28').value = { formula: 'C24-C27' };
  ws.getCell('C28').numFmt = currency;
  ws.getCell('C28').font = bigFont;
  ws.getCell('C28').border = { bottom: { style: 'double', color: { argb: 'FF141210' } } };

  // Difference
  ws.getCell('A30').value = 'You keep more at Aari';
  ws.getCell('A30').font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF2F6B46' } };
  ws.getCell('C30').value = { formula: 'C28-B28' };
  ws.getCell('C30').numFmt = currency;
  ws.getCell('C30').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF2F6B46' } };

  // Footer
  ws.getCell('A32').value = 'Aari Realty LLC  ·  9160 Forum Corporate Pkwy, Suite 350, Fort Myers, FL 33905';
  ws.getCell('A32').font = { name: 'Calibri', size: 9, color: { argb: 'FF999999' } };
  ws.mergeCells('A32:D32');

  // Print setup
  ws.pageSetup = { orientation: 'portrait', fitToPage: true };

  var outPath = path.join(__dirname, '..', 'aari-cost-comparison.xlsx');
  await wb.xlsx.writeFile(outPath);

  // Also write base64 module for API
  var buf = await wb.xlsx.writeBuffer();
  var b64 = buf.toString('base64');
  var mod = 'module.exports = ' + JSON.stringify(b64) + ';\n';
  fs.writeFileSync(path.join(__dirname, '..', 'api', '_spreadsheet.js'), mod);

  console.log('Generated:', outPath);
  console.log('Generated: api/_spreadsheet.js (' + Math.round(b64.length / 1024) + ' KB)');
}

main().catch(function (e) { console.error(e); process.exit(1); });
