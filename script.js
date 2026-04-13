'use strict';

const R = id => document.getElementById(id);

/* ── Formatting ─────────────────────────────────────── */
function fmt(n) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function parse(s) {
  return parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0;
}
function fmtInput(el) {
  const v = parse(el.value);
  if (v > 0) el.value = fmt(v);
}

/* ── Range sliders ──────────────────────────────────── */
function updateRange(rangeId, displayId, decimals, suffix) {
  const el = R(rangeId);
  el.addEventListener('input', () => {
    R(displayId).textContent = parseFloat(el.value).toFixed(decimals).replace('.', ',') + suffix;
    // live-recalc only if results already visible
    if (R('results').classList.contains('visible')) calculate();
  });
}

updateRange('rate',     'rateVal',    2, ' %');
updateRange('years',    'yearsVal',   0, ' años');
updateRange('openFee',  'openFeeVal', 1, ' %');
updateRange('discount', 'discountVal',2, ' %');

/* ── Auto-format money inputs ───────────────────────── */
let _liveT;
['price', 'down', 'homeInsCost', 'lifeInsCost'].forEach(id => {
  R(id).addEventListener('blur', function () { fmtInput(this); });
  R(id).addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { fmtInput(this); calculate(); }
  });
  R(id).addEventListener('input', function () {
    clearTimeout(_liveT);
    _liveT = setTimeout(() => {
      if (R('results').classList.contains('visible')) calculate();
    }, 350);
  });
});

/* ── Region / type selects → live recalc ───────────── */
['homeType', 'region', 'mortgageType'].forEach(id => {
  R(id).addEventListener('change', () => {
    if (R('results').classList.contains('visible')) calculate();
  });
});
['homeIns', 'lifeIns'].forEach(id => {
  R(id).addEventListener('change', () => {
    if (R('results').classList.contains('visible')) calculate();
  });
});

/* ── Collapse ───────────────────────────────────────── */
function toggleC(id) {
  R(id + 'Trigger').classList.toggle('open');
  R(id + 'Body').classList.toggle('open');
}
window.toggleC = toggleC;

/* ── ITP / IGIC table ───────────────────────────────── */
const ITP = {
  andalucia:        { r: .07,  l: 'ITP (7%)' },
  aragon:           { r: .08,  l: 'ITP (8%)' },
  asturias:         { r: .08,  l: 'ITP (8%)' },
  baleares:         { r: .08,  l: 'ITP (8%)' },
  canarias:         { r: .065, l: 'IGIC (6,5%)' },
  cantabria:        { r: .10,  l: 'ITP (10%)' },
  castilla_la_mancha: { r: .09, l: 'ITP (9%)' },
  castilla_leon:    { r: .08,  l: 'ITP (8%)' },
  cataluna:         { r: .10,  l: 'ITP (10%)' },
  extremadura:      { r: .08,  l: 'ITP (8%)' },
  galicia:          { r: .10,  l: 'ITP (10%)' },
  la_rioja:         { r: .07,  l: 'ITP (7%)' },
  madrid:           { r: .06,  l: 'ITP (6%)' },
  murcia:           { r: .08,  l: 'ITP (8%)' },
  navarra:          { r: .06,  l: 'ITP (6%)' },
  pais_vasco:       { r: .04,  l: 'ITP (4%)' },
  valencia:         { r: .10,  l: 'ITP (10%)' },
};

/* ── Core calculation ───────────────────────────────── */
function calculate() {
  const price = parse(R('price').value);
  const down  = parse(R('down').value);
  if (price <= 0 || down < 0) return;

  const tinBase = parseFloat(R('rate').value) / 100;
  const disc    = parseFloat(R('discount').value) / 100;
  const tin     = Math.max(tinBase - disc, 0.001);
  const years   = parseInt(R('years').value);
  const openP   = parseFloat(R('openFee').value) / 100;
  const hType   = R('homeType').value;
  const reg     = R('region').value;
  const hIns    = R('homeIns').checked ? parse(R('homeInsCost').value) : 0;
  const lIns    = R('lifeIns').checked ? parse(R('lifeInsCost').value) : 0;

  const loan = price - down;
  if (loan <= 0) return; /* silently skip invalid intermediate state while typing */

  const n   = years * 12;
  const r   = tin / 12;
  const pmt = r > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;

  const totalPaid = pmt * n;
  const totalInt  = totalPaid - loan;
  const totIns    = (hIns + lIns) * years;
  const moIns     = (hIns + lIns) / 12;

  /* TAE via Newton-Raphson (FEIN monthly payments + insurance) */
  const openAmt = loan * openP;
  const netLoan = loan - openAmt;
  let tae = tin;
  for (let i = 0; i < 80; i++) {
    const pm = pmt + moIns;
    const er = tae / 12;
    let pv = 0, dp = 0;
    for (let m = 1; m <= n; m++) {
      const disc2 = Math.pow(1 + er, m);
      pv += pm / disc2;
      dp += -m * pm / (12 * disc2 * (1 + er));
    }
    const d = pv - netLoan;
    if (Math.abs(dp) < 1e-12) break;
    tae -= d / dp;
    if (Math.abs(d) < 0.001) break;
  }
  if (tae < 0 || !isFinite(tae)) tae = tin;

  /* Tax calculation */
  const rd = ITP[reg] || ITP.general;
  let tax, taxL;
  if (hType === 'new') {
    tax  = price * 0.10 + price * 0.015;
    taxL = 'IVA (10%) + AJD (1,5%)';
  } else {
    tax  = price * rd.r;
    taxL = rd.l;
  }

  const notary = Math.min(Math.max(price * 0.003, 600), 1200) + Math.min(Math.max(price * 0.002, 400), 800);
  const gest   = 400;
  const tas    = 350;
  const costs  = tax + notary + gest + tas + openAmt;

  /* ── Render results ── */
  R('monthly').textContent  = fmt(Math.round(pmt)) + ' €/mes';
  R('termSub').textContent  = `durante ${years} años · TIN ${(tin * 100).toFixed(2).replace('.', ',')}%`;
  R('rLoan').textContent    = fmt(loan) + ' €';
  R('rTIN').textContent     = (tin * 100).toFixed(2).replace('.', ',') + ' %';
  R('rTAE').textContent     = (tae * 100).toFixed(2).replace('.', ',') + ' %';
  R('rInterest').textContent= fmt(Math.round(totalInt)) + ' €';
  R('rTotal').textContent   = fmt(Math.round(totalPaid)) + ' €';

  /* Donut chart */
  const C = 314.159;
  const donutTot = loan + totalInt + (totIns || 0);
  const capArc = loan / donutTot * C;
  const intArc = totalInt / donutTot * C;
  R('donutCap').setAttribute('stroke-dasharray', capArc + ' ' + C);
  R('donutCap').setAttribute('stroke-dashoffset', 0);
  R('donutInt').setAttribute('stroke-dasharray', intArc + ' ' + C);
  R('donutInt').setAttribute('stroke-dashoffset', -capArc);
  R('barCapA').textContent = fmt(loan) + ' €';
  R('barIntA').textContent = fmt(Math.round(totalInt)) + ' €';
  if (totIns > 0) {
    const insArc = totIns / donutTot * C;
    R('barInsR').style.display = 'flex';
    R('donutIns').setAttribute('stroke-dasharray', insArc + ' ' + C);
    R('donutIns').setAttribute('stroke-dashoffset', -(capArc + intArc));
    R('barInsA').textContent = fmt(Math.round(totIns)) + ' €';
  } else {
    R('barInsR').style.display = 'none';
    R('donutIns').setAttribute('stroke-dasharray', '0 314');
  }
  R('donutCenter').textContent = fmt(Math.round(donutTot)) + ' €';

  /* LTV + mortgage type badges */
  const ltv = Math.round(loan / price * 100);
  R('ltvBadge').textContent = 'LTV ' + ltv + '%';
  const mType = R('mortgageType');
  R('mortTypeBadge').textContent = mType.options[mType.selectedIndex].text;

  /* Costs */
  R('taxLabel').textContent = taxL;
  R('rTax').textContent     = fmt(Math.round(tax)) + ' €';
  R('rNotary').textContent  = fmt(Math.round(notary)) + ' €';
  R('rGest').textContent    = fmt(gest) + ' €';
  R('rTas').textContent     = fmt(tas) + ' €';
  R('rOpen').textContent    = fmt(Math.round(openAmt)) + ' €';
  R('rCosts').textContent   = fmt(Math.round(costs)) + ' €';

  /* Savings tip */
  R('tipD').textContent = fmt(down) + ' €';
  R('tipC').textContent = fmt(Math.round(costs)) + ' €';
  R('tipT').textContent = fmt(Math.round(down + costs)) + ' €';

  /* Amortisation table */
  let bal = loan, html = '', ta = 0;
  for (let y = 1; y <= years; y++) {
    let yc = 0, yi = 0;
    for (let m = 0; m < 12; m++) {
      const mi = bal * r;
      const mc = pmt - mi;
      yi += mi; yc += mc; bal -= mc;
    }
    if (bal < 0) bal = 0;
    ta += yc;
    html += `<tr>
      <td>${y}</td>
      <td>${fmt(Math.round(yc))} €</td>
      <td>${fmt(Math.round(yi))} €</td>
      <td>${fmt(Math.round(ta))} €</td>
      <td>${fmt(Math.round(bal))} €</td>
    </tr>`;
  }
  R('amortB').innerHTML = html;

  /* Show panel */
  const panel = R('results');
  panel.classList.remove('visible');
  void panel.offsetWidth; // force reflow for re-animation
  panel.classList.add('visible');

  /* on mobile (single column) scroll results into view */
  if (window.innerWidth <= 860) {
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }
}
window.calculate = calculate;

/* ── Toggle amortisation ───────────────────────────── */
function toggleA() { R('amortW').classList.toggle('open'); }
window.toggleA = toggleA;

/* ── Auto-calculate with market defaults on load ─── */
document.addEventListener('DOMContentLoaded', calculate);

